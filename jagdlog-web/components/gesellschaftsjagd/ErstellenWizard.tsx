'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WizardState } from '@/lib/types/gesellschaftsjagd';
import { JAGD_TYPEN, getJagdTypLabel } from '@/lib/types/gesellschaftsjagd';

interface ErstellenWizardProps {
  revierId: string;
  userId: string;
  onSubmit: (state: WizardState) => Promise<void>;
}

export default function ErstellenWizard({ revierId, userId, onSubmit }: ErstellenWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    validated: false,
  });

  const steps = [
    { number: 1, title: 'Grunddaten', icon: '📋' },
    { number: 2, title: 'Teilnehmer', icon: '👥' },
    { number: 3, title: 'Standorte', icon: '📍' },
    { number: 4, title: 'Sicherheit', icon: '🛡️' },
    { number: 5, title: 'Überprüfung', icon: '✅' },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          wizardState.grunddaten &&
          wizardState.grunddaten.name &&
          wizardState.grunddaten.datum &&
          wizardState.grunddaten.start_zeit &&
          wizardState.grunddaten.end_zeit &&
          wizardState.grunddaten.jagd_typ
        );
      case 2:
        return true; // Optional
      case 3:
        return true; // Optional
      case 4:
        return true; // Optional
      case 5:
        return validateStep(1); // Must have grunddaten
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCancel = () => {
    if (confirm('Möchten Sie den Vorgang wirklich abbrechen? Alle Eingaben gehen verloren.')) {
      router.push('/gesellschaftsjagd');
    }
  };

  const handleSubmitWizard = async () => {
    if (!validateStep(5)) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...wizardState, validated: true });
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Fehler beim Erstellen der Jagd. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Grunddaten state={wizardState} setState={setWizardState} />;
      case 2:
        return <Step2Teilnehmer state={wizardState} setState={setWizardState} />;
      case 3:
        return <Step3Standorte state={wizardState} setState={setWizardState} />;
      case 4:
        return <Step4Sicherheit state={wizardState} setState={setWizardState} />;
      case 5:
        return <Step5Ueberpruefung state={wizardState} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                    currentStep >= step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="mt-2 text-sm font-medium text-center">
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Abbrechen
        </button>

        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Zurück
            </button>
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleSubmitWizard}
              disabled={isSubmitting || !validateStep(5)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Wird erstellt...' : '✅ Jagd erstellen'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Grunddaten
function Step1Grunddaten({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  const updateGrunddaten = (field: string, value: any) => {
    setState({
      ...state,
      grunddaten: {
        ...state.grunddaten!,
        [field]: value,
      },
    });
  };

  const grunddaten = state.grunddaten || {
    name: '',
    beschreibung: '',
    datum: '',
    start_zeit: '',
    end_zeit: '',
    jagd_typ: 'drueckjagd' as const,
    erwartete_jaeger: 10,
    erwartete_treiber: 20,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Grunddaten</h2>

      <div>
        <label className="block text-sm font-medium mb-1">
          Name der Jagd <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={grunddaten.name}
          onChange={(e) => updateGrunddaten('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="z.B. Herbst-Drückjagd 2024"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Beschreibung</label>
        <textarea
          value={grunddaten.beschreibung}
          onChange={(e) => updateGrunddaten('beschreibung', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Optionale Beschreibung..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Datum <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={grunddaten.datum}
            onChange={(e) => updateGrunddaten('datum', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Start <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={grunddaten.start_zeit}
            onChange={(e) => updateGrunddaten('start_zeit', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Ende <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={grunddaten.end_zeit}
            onChange={(e) => updateGrunddaten('end_zeit', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Jagdtyp <span className="text-red-500">*</span>
        </label>
        <select
          value={grunddaten.jagd_typ}
          onChange={(e) => updateGrunddaten('jagd_typ', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          required
        >
          {JAGD_TYPEN.map((typ) => (
            <option key={typ} value={typ}>
              {getJagdTypLabel(typ)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Erwartete Jäger</label>
          <input
            type="number"
            min="1"
            max="100"
            value={grunddaten.erwartete_jaeger}
            onChange={(e) => updateGrunddaten('erwartete_jaeger', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Erwartete Treiber</label>
          <input
            type="number"
            min="0"
            max="200"
            value={grunddaten.erwartete_treiber}
            onChange={(e) => updateGrunddaten('erwartete_treiber', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
}

// Step 2-5 Placeholders (will be replaced by actual components)
function Step2Teilnehmer({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Teilnehmer</h2>
      <p className="text-gray-600">Teilnehmer können nach der Erstellung hinzugefügt werden.</p>
    </div>
  );
}

function Step3Standorte({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Standorte</h2>
      <p className="text-gray-600">Standorte können nach der Erstellung auf der Karte hinzugefügt werden.</p>
    </div>
  );
}

function Step4Sicherheit({ state, setState }: { state: WizardState; setState: (s: WizardState) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sicherheit</h2>
      <p className="text-gray-600">Sicherheitsregeln und Notfallkontakte können nach der Erstellung hinzugefügt werden.</p>
    </div>
  );
}

function Step5Ueberpruefung({ state }: { state: WizardState }) {
  const grunddaten = state.grunddaten;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Überprüfung</h2>
      
      {grunddaten ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Grunddaten</h3>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="font-medium w-32">Name:</dt>
                <dd>{grunddaten.name}</dd>
              </div>
              {grunddaten.beschreibung && (
                <div className="flex">
                  <dt className="font-medium w-32">Beschreibung:</dt>
                  <dd>{grunddaten.beschreibung}</dd>
                </div>
              )}
              <div className="flex">
                <dt className="font-medium w-32">Datum:</dt>
                <dd>{new Date(grunddaten.datum).toLocaleDateString('de-DE')}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Zeit:</dt>
                <dd>{grunddaten.start_zeit} - {grunddaten.end_zeit}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Typ:</dt>
                <dd>{getJagdTypLabel(grunddaten.jagd_typ)}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Jäger:</dt>
                <dd>{grunddaten.erwartete_jaeger}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Treiber:</dt>
                <dd>{grunddaten.erwartete_treiber}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ Die Jagd wird erstellt. Sie können anschließend Teilnehmer, Standorte und Sicherheitszonen hinzufügen.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-red-500">Fehler: Grunddaten fehlen</p>
      )}
    </div>
  );
}
