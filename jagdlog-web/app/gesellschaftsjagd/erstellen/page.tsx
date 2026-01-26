'use client';

import { useRouter } from 'next/navigation';
import ErstellenWizard from '@/components/gesellschaftsjagd/ErstellenWizard';
import type { WizardState } from '@/lib/types/gesellschaftsjagd';
import { createGesellschaftsjagd } from '@/lib/services/gesellschaftsjagdService';

export default function ErstellenPage() {
  const router = useRouter();

  // TODO: Get from auth context
  const userId = 'demo-user-id';
  const revierId = 'demo-revier-id';

  const handleSubmit = async (state: WizardState) => {
    if (!state.grunddaten) {
      throw new Error('Grunddaten fehlen');
    }

    try {
      const jagd = await createGesellschaftsjagd({
        revier_id: revierId,
        organisator_id: userId,
        ...state.grunddaten,
        status: 'planung',
        sicherheitsregeln: state.sicherheit?.sicherheitsregeln 
          ? JSON.stringify(state.sicherheit.sicherheitsregeln)
          : undefined,
        notfall_kontakte: state.sicherheit?.notfall_kontakte
          ? JSON.stringify(state.sicherheit.notfall_kontakte)
          : undefined,
        erstellt_von: userId,
        aktualisiert_von: userId,
      });

      // Success - redirect to detail page
      router.push(`/gesellschaftsjagd/${jagd.id}`);
    } catch (error) {
      console.error('Error creating jagd:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pt-28 md:pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            🎯 Neue Gesellschaftsjagd erstellen
          </h1>
          <p className="text-gray-600 mt-1">
            Folgen Sie dem 5-Schritte-Prozess, um Ihre Jagd zu planen
          </p>
        </div>

        {/* Wizard */}
        <ErstellenWizard
          revierId={revierId}
          userId={userId}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
