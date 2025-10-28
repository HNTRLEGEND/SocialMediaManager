import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomerAgentConfigService } from '../services/customer-agent-config.service';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/api-key.guard';
import { SheetMappingService } from '../services/sheet-mapping.service';
import { ProductCatalogService } from '../services/product-catalog.service';
import { GoogleSheetsService } from '../services/google-sheets.service';

@UseGuards(ApiKeyGuard)
@Controller('api/wieslogic')
export class ConfigController {
  constructor(
    private readonly customerConfig: CustomerAgentConfigService,
    private readonly sheets: SheetMappingService,
    private readonly catalog: ProductCatalogService,
    private readonly gSheets: GoogleSheetsService,
  ) {}

  @Post('config/:customerId')
  createConfig(@Param('customerId') customerId: string, @Body() body: any) {
    return this.customerConfig.createConfig(customerId, body);
  }

  @Get('config/:customerId')
  getConfig(@Param('customerId') customerId: string) {
    return this.customerConfig.getConfig(customerId);
  }

  @Patch('config/:customerId')
  updateConfig(
    @Param('customerId') customerId: string,
    @Body() updates: any,
  ) {
    return this.customerConfig.updateConfig(customerId, updates);
  }

  @Get('config/:customerId/sheets')
  getSheetMappings(@Param('customerId') customerId: string) {
    return this.sheets.getLogicalToActualMap(customerId);
  }

  @Post('config/:customerId/sheets')
  setSheetMapping(
    @Param('customerId') customerId: string,
    @Body() body: { logicalName: string; actualSheetName: string },
  ) {
    return this.sheets.setMapping(customerId, body);
  }

  @Get('config/:customerId/sheets/headers')
  async getSheetHeaders(
    @Param('customerId') customerId: string,
    @Query('logical') logical?: string,
    @Query('sheet') sheet?: string,
  ) {
    const cfg = await this.customerConfig.getConfig(customerId);
    if (!cfg.googleSheetId) return { ok: false, message: 'googleSheetId missing in config' };
    if (!this.gSheets.isConfigured())
      return {
        ok: false,
        message:
          'Google Sheets not configured (set GOOGLE_SA_EMAIL + GOOGLE_SA_PRIVATE_KEY or GOOGLE_CREDENTIALS_JSON_BASE64)',
      };
    const map = await this.sheets.getLogicalToActualMap(customerId);
    const actual = sheet || (logical ? (map as any)[logical] : undefined);
    if (!actual) return { ok: false, message: 'Provide ?logical=<name> (mapped) or ?sheet=<ActualTabName>' };
    const safeName = `'${actual.replace(/'/g, "''")}'`;
    const range = `${safeName}!1:1`;
    try {
      const res = await this.gSheets.readValues(cfg.googleSheetId, range);
      const headers = ((res as any).rows?.[0] || []).map((h: any) => (h ?? '').toString());
      return { ok: true, sheet: actual, headers };
    } catch (e: any) {
      return { ok: false, message: `Read failed for ${range}: ${e?.message || e}` };
    }
  }

  @Post('config/:customerId/catalog')
  upsertCatalog(
    @Param('customerId') customerId: string,
    @Body() body: any,
  ) {
    return this.catalog.upsertCategory(customerId, body);
  }

  @Get('config/:customerId/catalog')
  listCatalog(@Param('customerId') customerId: string) {
    return this.catalog.listCategories(customerId);
  }

  @Get('config/:customerId/sheets/health')
  async sheetHealth(@Param('customerId') customerId: string) {
    const required = [
      'inquiries','quotations','customer_profile','reports','service_log','product_portfolio',
      'mechanical_specs','electrical_specs','packaging_specs','marketing_log','chart_data',
      'master_log','performance_log','health_log','evaluation_log','client_config','lead_intelligence'
    ];
    const map = await this.sheets.getLogicalToActualMap(customerId);
    const present = Object.keys(map||{});
    const missing = required.filter(k => !present.includes(k));
    return {
      customerId,
      totalRequired: required.length,
      presentCount: present.length,
      missingCount: missing.length,
      missing,
      mappings: map,
    };
  }

  @Post('config/:customerId/catalog/import-from-sheets')
  async importCatalog(@Param('customerId') customerId: string) {
    const cfg = await this.customerConfig.getConfig(customerId);
    const map = await this.sheets.getLogicalToActualMap(customerId);
    const sheetName = map['product_portfolio'] || '06_Product_Portfolio';
    if (!cfg.googleSheetId) {
      return { ok: false, message: 'googleSheetId not set in config' };
    }
    if (!this.gSheets.isConfigured()) {
      return { ok: false, message: 'Google Sheets not configured. Set GOOGLE_SA_EMAIL and GOOGLE_SA_PRIVATE_KEY in .env' };
    }
    const safeName = `'${sheetName.replace(/'/g, "''")}'`;
    const range = `${safeName}!A:Z`;
    let rows: any[] = [];
    let configured = true;
    try {
      const res = await this.gSheets.readValues(cfg.googleSheetId, range);
      rows = res.rows as any[];
      configured = !!res.configured;
    } catch (e: any) {
      return { ok: false, message: `Google Sheets read failed: ${e?.message || e}` };
    }
    if (!configured) {
      return { ok: false, message: 'Google Sheets client not configured' };
    }
    if (!rows || rows.length < 1) {
      return { ok: false, message: 'No rows found in product portfolio sheet' };
    }
    // Auto-detect header row by presence of key columns
    let headerIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const hr = (rows[i] as string[]).map((h) => normalize(h));
      if (!hr || hr.length === 0) continue;
      const hasModel = hr.includes('model') || hr.includes('model_name');
      const hasCategory = hr.includes('category') || hr.includes('kategorie');
      if (hasModel || hasCategory) { headerIdx = i; break; }
    }
    if (headerIdx === -1) {
      return { ok: false, message: 'Could not detect header row. Ensure columns include at least "category" and "model".' };
    }
    const headers = (rows[headerIdx] as string[]).map((h) => normalize(h));
    const dataRows = rows.slice(headerIdx + 1).filter((r) => r && r.length > 0);
    const find = (row: any[], key: string) => {
      const idx = headers.indexOf(key);
      return idx >= 0 ? row[idx] : undefined;
    };
    const groups: Record<string, { models: string[]; basePricing: Record<string, any>; calc?: string }> = {};
    for (const r of dataRows) {
      const categoryRaw = (find(r, 'category') || find(r, 'kategorie') || '').toString();
      const model = (find(r, 'model') || find(r, 'model_name') || '').toString();
      if (!categoryRaw || !model) continue;
      const category = snake(categoryRaw);
      const price = find(r, 'base_price') || find(r, 'preis') || undefined;
      const calc = find(r, 'calculation_module') || undefined;
      if (!groups[category]) groups[category] = { models: [], basePricing: {} };
      if (calc) groups[category].calc = calc.toString();
      if (!groups[category].models.includes(model)) groups[category].models.push(model);
      if (price !== undefined && price !== '') groups[category].basePricing[model] = price;
    }
    const results: any[] = [];
    for (const [category, info] of Object.entries(groups)) {
      const dto = {
        category,
        enabled: true,
        models: info.models,
        calculationModule: info.calc || guessCalc(category),
        basePricing: Object.keys(info.basePricing).length ? info.basePricing : undefined,
      } as any;
      const res = await this.catalog.upsertCategory(customerId, dto);
      results.push({ category, models: info.models.length });
    }
    return { ok: true, updated: results.length, categories: results };
  }
}

function normalize(h: string) {
  return h?.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}
function snake(s: string) {
  return s?.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}
function guessCalc(category: string) {
  if (category.includes('pallet') && category.includes('wrapper')) return 'pallet_wrapper';
  if (category.includes('palletizer')) return 'palletizers';
  if (category.includes('depallet')) return 'depalletizers';
  if (category.includes('lgv')) return 'lgvs';
  if (category.includes('case_packer') || category.includes('case_packing')) return 'case_packing_machines';
  if (category.includes('shrink')) return 'shrink_wrappers';
  if (category.includes('tray')) return 'tray_shrink_wrappers';
  if (category.includes('bag_sealer')) return 'bag_sealers';
  if (category.includes('cobot')) return 'cobots';
  return 'unknown';
}


