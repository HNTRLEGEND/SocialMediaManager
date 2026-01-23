# 🚀 HNTR LEGEND v2.8.0 - Production Build Instructions

**Status:** ✅ Build Configuration Complete  
**Version:** 2.8.0  
**Date:** 23. Januar 2026

---

## ✅ PRE-BUILD CHECKLIST

- [x] Code merged to main (Commit: 5f3cb2c)
- [x] Version updated: 2.8.0
- [x] EAS CLI installed: v16.28.0
- [x] eas.json configured
- [x] app.json configured
- [x] Permissions added (Location, Camera, Gallery)
- [x] Git tag created: v2.8.0

---

## 📱 STEP 1: EAS PROJECT INITIALIZATION

**First-time setup (run once):**

```bash
cd /home/SocialMediaManager/jagdlog-pro

# Login to Expo account
eas login
# Enter your Expo credentials

# Initialize EAS project
eas init

# Link to existing project or create new one
# Choose: Create new project "HNTR LEGEND PRO"

# Configure project
eas project:init
```

**Expected Output:**
```
✔ Project successfully initialized
✔ Project ID: abc123def456
✔ Slug: hntr-legend-pro
```

**Update app.json with Project ID:**
After initialization, update line 37 in `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "YOUR_ACTUAL_PROJECT_ID_FROM_INIT"
  }
}
```

---

## 🍎 STEP 2: iOS BUILD (TestFlight)

### **2.1 Apple Developer Setup**

**Required:**
- Apple Developer Account ($99/year)
- App Identifier: `com.hntrlegend.jagdlogpro`
- App Store Connect access

**Setup in App Store Connect:**
1. Go to https://appstoreconnect.apple.com
2. Create new app:
   - Name: **HNTR LEGEND PRO**
   - Bundle ID: `com.hntrlegend.jagdlogpro`
   - SKU: `hntr-legend-pro-2026`
   - Primary Language: German
3. Note the **App ID** (e.g., 1234567890)

**Update eas.json:**
Replace lines in `submit.preview.ios`:
```json
"ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
"appleTeamId": "YOUR_APPLE_TEAM_ID"
```

### **2.2 Build iOS (Preview/TestFlight)**

```bash
cd /home/SocialMediaManager/jagdlog-pro

# Build for iOS TestFlight
npm run build:ios:preview

# Alternative direct command:
# eas build --platform ios --profile preview
```

**Build Process:**
1. EAS will ask for Apple credentials
2. Build starts on EAS servers (~15-20 minutes)
3. You'll get a build URL to monitor progress
4. Download .ipa when complete

**Example Output:**
```
✔ Credentials set up
✔ Compiled iOS app
✔ Build completed
🔗 https://expo.dev/accounts/YOUR_ACCOUNT/projects/hntr-legend-pro/builds/abc123
```

### **2.3 Submit to TestFlight**

```bash
# Automatic submission
npm run submit:ios

# Follow prompts:
# - Select build ID (from previous step)
# - Enter Apple ID password
# - Submit for TestFlight
```

**TestFlight Availability:**
- Internal testers: ~5 minutes
- External testers: 1-2 days (Apple review)

**Invite Testers:**
1. App Store Connect → TestFlight
2. Add internal testers (email addresses)
3. They receive invite link
4. Install TestFlight app → Open invite

---

## 🤖 STEP 3: ANDROID BUILD (Play Store Beta)

### **3.1 Google Play Console Setup**

**Required:**
- Google Play Developer Account ($25 one-time)
- Package name: `com.hntrlegend.jagdlogpro`

**Setup in Google Play Console:**
1. Go to https://play.google.com/console
2. Create new app:
   - Name: **HNTR LEGEND PRO**
   - Default language: German
   - App/Game: App
   - Free/Paid: Free
3. Complete store listing (minimum):
   - Short description (80 chars)
   - Full description (4000 chars)
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (2-8, phone + tablet)

### **3.2 Service Account (for automatic submission)**

**Create Service Account:**
1. Google Cloud Console → IAM & Admin → Service Accounts
2. Create service account: `hntr-legend-deployer`
3. Grant roles:
   - Service Account User
   - Service Account Token Creator
4. Create JSON key
5. Download as `google-play-service-account.json`
6. Move to `/home/SocialMediaManager/jagdlog-pro/`

**Security:**
```bash
# Add to .gitignore
echo "google-play-service-account.json" >> .gitignore
```

**Link to Play Console:**
1. Play Console → Settings → API access
2. Link service account
3. Grant permissions: Release manager

### **3.3 Build Android (Preview/Beta)**

```bash
cd /home/SocialMediaManager/jagdlog-pro

# Build for Android
npm run build:android:preview

# Alternative:
# eas build --platform android --profile preview
```

**Build Process:**
1. EAS compiles Android app (~15-20 minutes)
2. Generates .apk (for preview) or .aab (for production)
3. Download when complete

**Example Output:**
```
✔ Compiled Android app
✔ Build completed
🔗 https://expo.dev/accounts/YOUR_ACCOUNT/projects/hntr-legend-pro/builds/def456
📱 Download APK: https://expo.dev/.../download
```

### **3.4 Submit to Play Store Beta**

```bash
# Automatic submission
npm run submit:android

# Follow prompts:
# - Select build ID
# - Choose track: internal (beta)
# - Submit
```

**Play Store Beta Availability:**
- Internal testing: Immediate
- Closed testing: No review needed
- Open testing: May require review

**Invite Testers:**
1. Play Console → Testing → Internal testing
2. Create email list
3. Add testers
4. Share opt-in URL

---

## 🚀 STEP 4: BUILD BOTH PLATFORMS

**Simultaneous build (recommended):**

```bash
cd /home/SocialMediaManager/jagdlog-pro

# Build iOS + Android together
npm run build:all:preview

# This runs:
# eas build --platform all --profile preview
```

**Advantages:**
- Single command for both platforms
- Parallel builds (saves time)
- Consistent version across platforms

**Timeline:**
- Total time: ~20 minutes (parallel builds)
- iOS build: 15-18 minutes
- Android build: 15-20 minutes

---

## 📊 STEP 5: MONITOR BUILDS

**EAS Dashboard:**
```bash
# Open build dashboard
eas build:list

# View specific build
eas build:view BUILD_ID
```

**Web Dashboard:**
- https://expo.dev/accounts/YOUR_ACCOUNT/projects/hntr-legend-pro/builds

**Build Status:**
- ⏳ In Queue
- 🔨 Building
- ✅ Finished
- ❌ Failed

**Failed Build?**
```bash
# View logs
eas build:view BUILD_ID

# Common issues:
# - Missing credentials → Run: eas credentials
# - Invalid app.json → Check syntax
# - Dependency errors → Run: npm install
```

---

## 🧪 STEP 6: INSTALL & TEST

### **iOS (TestFlight)**

**Testers install:**
1. Install TestFlight app (App Store)
2. Open invite email → "View in TestFlight"
3. Tap "Install"
4. Launch app

**Test Checklist:**
- [ ] App launches without crash
- [ ] GPS permission prompt works
- [ ] Camera permission works
- [ ] Shot Analysis screen loads
- [ ] Map displays correctly
- [ ] Database migration successful
- [ ] Crowdsourcing upload works

### **Android (Play Store Beta)**

**Testers install:**
1. Open opt-in URL in browser
2. Tap "Become a tester"
3. Open Play Store → Search "HNTR LEGEND PRO"
4. Install

**Test Checklist:**
- [ ] App launches without crash
- [ ] GPS tracking works (background)
- [ ] Camera integration works
- [ ] MapView renders correctly
- [ ] Database works
- [ ] Upload functionality

---

## 📈 STEP 7: MONITOR METRICS

**First 24 Hours:**

**Sentry Setup (Error Tracking):**
```bash
# Install Sentry
npm install --save @sentry/react-native

# Configure in App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
  release: '2.8.0',
});
```

**Key Metrics:**
- Crash rate: <1% target
- App launch time: <3s target
- Shot Analysis usage: 30%+ target
- GPS accuracy: <10m median
- Upload success rate: >95% target

**Analytics Events:**
```typescript
// Track feature usage
analytics.track('app_opened', { version: '2.8.0' });
analytics.track('shot_analysis_started');
analytics.track('recovery_success', { time_to_find: 3600 });
analytics.track('training_data_uploaded');
```

**EAS Analytics:**
```bash
# View crash reports
eas build:inspect

# Download logs
eas build:view --json
```

---

## 🔄 STEP 8: ITERATIVE UPDATES

**Hot Fix (Urgent Bug):**
```bash
# Fix code
git add -A
git commit -m "fix: Critical bug in GPS tracking"
git push

# Build + Submit
npm run build:all:preview
npm run submit:ios
npm run submit:android
```

**Feature Update (v2.8.1):**
```bash
# Update version in app.json
"version": "2.8.1"

# Update versionCode/buildNumber
"ios": { "buildNumber": "2" }
"android": { "versionCode": 2 }

# Build + Submit
npm run build:all:production
```

---

## ⚠️ ROLLBACK PLAN

**If critical issues found:**

**iOS:**
1. App Store Connect → TestFlight
2. Remove v2.8.0 from testing
3. Re-activate v2.7.x

**Android:**
1. Play Console → Release → Production
2. Halt rollout of v2.8.0
3. Promote v2.7.x to 100%

**Emergency Rollback Build:**
```bash
# Checkout previous version
git checkout v2.7.0

# Build emergency release
eas build --platform all --profile production
```

---

## 📋 POST-DEPLOYMENT CHECKLIST

**Week 1:**
- [ ] Monitor crash reports (daily)
- [ ] Check user feedback (reviews)
- [ ] Track feature adoption (analytics)
- [ ] Collect bug reports (support tickets)
- [ ] Monitor server load (API)
- [ ] Check upload success rate (crowdsourcing)

**Key Thresholds:**
- Crash rate >2% → Investigate immediately
- GPS failure >20% → Check permissions
- Upload failure >10% → Check API/storage
- Negative reviews >30% → Urgent triage

**Communication:**
- Day 1: Push notification to all users
- Day 3: Email newsletter with feature tour
- Week 1: Social media campaign
- Week 2: Press releases

---

## 🎉 SUCCESS METRICS

**Week 1 Targets:**
- ✅ 1,000+ downloads
- ✅ 30% Shot Analysis adoption
- ✅ 500+ crowdsourcing uploads
- ✅ <1% crash rate
- ✅ 4+ star rating

**Month 1 Targets:**
- ✅ 5,000+ MAU
- ✅ 5,000+ training images
- ✅ +€15k MRR
- ✅ Featured in App Store

**Month 3 Targets:**
- ✅ 10,000+ MAU
- ✅ ML training started
- ✅ +€50k MRR
- ✅ Market leader

---

## 🆘 SUPPORT & TROUBLESHOOTING

**Common Issues:**

**1. "Unable to find Apple Distribution certificate"**
```bash
eas credentials
# Select: iOS → Distribution Certificate → Generate new
```

**2. "Google Service Account authentication failed"**
```bash
# Verify JSON key permissions in Play Console
# Re-download service account key
```

**3. "Build failed: Gradle error"**
```bash
# Clear build cache
rm -rf android/.gradle
eas build --platform android --clear-cache
```

**4. "App crashes on launch"**
```bash
# Check logs
eas build:view BUILD_ID
# Look for: JS errors, native module issues, permission denials
```

**Get Help:**
- EAS Docs: https://docs.expo.dev/eas/
- Discord: https://discord.gg/expo
- Forum: https://forums.expo.dev/
- Support: support@hntrlegend.com

---

## 📞 CONTACTS

**On-Call (Week 1):**
- Tech Lead: [Phone]
- Product Manager: [Phone]
- Support Lead: [Phone]

**Emergency Escalation:**
- Critical bug: Call Tech Lead immediately
- Server down: Contact DevOps + CTO
- Data breach: Legal + Security + CEO

---

## ✅ YOU'RE READY!

**Current Status:**
- ✅ EAS CLI installed (v16.28.0)
- ✅ Build config complete (eas.json, app.json)
- ✅ Version 2.8.0 set
- ✅ Permissions configured
- ✅ Git committed (5f3cb2c)

**Next Command:**
```bash
cd /home/SocialMediaManager/jagdlog-pro

# First-time:
eas login
eas init

# Then build:
npm run build:all:preview

# Or for production:
npm run build:all:production
```

**Estimated Timeline:**
- Setup (first-time): 15 minutes
- Build time: 20 minutes
- TestFlight review: 5 minutes (internal)
- Play Store beta: Immediate

**Total to first testers: ~40 minutes** 🚀

---

**Ready to launch? Let's make history!** 🎯

*"The best hunting app in the world isn't built by one team - it's built by 100,000 hunters together."*
