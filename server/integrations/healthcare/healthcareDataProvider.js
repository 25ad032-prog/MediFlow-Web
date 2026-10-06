// DOCBEE MediFlow - Healthcare Data Provider Integration Gateway
// Central factory and manager for healthcare data interoperability.
// Dynamically routes queries to either External FHIR API Provider or Synthetic FHIR Provider.

const SyntheticHealthcareProvider = require('./syntheticProvider');
const FhirHealthcareProvider = require('./fhirClient');

class HealthcareDataProviderManager {
  constructor() {
    this.syntheticProvider = new SyntheticHealthcareProvider();
    this.fhirProvider = new FhirHealthcareProvider();
    
    // Determine initial mode from environment variable
    const isFhirEnabled = process.env.FHIR_ENABLED === 'true';
    this.activeMode = isFhirEnabled ? 'fhir_api' : 'synthetic';
    
    console.log(`[MediFlow Healthcare Integration] Active Provider Mode: ${this.activeMode.toUpperCase()}`);
    if (isFhirEnabled) {
      console.log(`[MediFlow Healthcare Integration] FHIR Base URL: ${process.env.FHIR_BASE_URL || 'http://localhost:8080/fhir'}`);
    }
  }

  getProvider() {
    if (this.activeMode === 'fhir_api') {
      return this.fhirProvider;
    }
    return this.syntheticProvider;
  }

  switchProvider(mode) {
    if (mode === 'fhir_api' || mode === 'fhir') {
      this.activeMode = 'fhir_api';
    } else {
      this.activeMode = 'synthetic';
    }
    console.log(`[MediFlow Healthcare Integration] Switched provider to: ${this.activeMode.toUpperCase()}`);
    return this.getStatus();
  }

  getStatus() {
    const currentProvider = this.getProvider();
    const isFhirConfigured = Boolean(process.env.FHIR_BASE_URL);
    
    return {
      activeMode: this.activeMode,
      providerName: currentProvider.name,
      isExternalEnabled: process.env.FHIR_ENABLED === 'true',
      isFhirConfigured,
      fhirBaseUrl: process.env.FHIR_BASE_URL || null,
      isFallbackActive: this.activeMode === 'fhir_api' ? !this.fhirProvider.isExternalReachable : false,
      standard: 'HL7 FHIR Release 4 (R4)',
      supportedResources: [
        'Patient',
        'Practitioner',
        'Organization',
        'Appointment',
        'Schedule',
        'Slot',
        'Encounter',
        'Observation',
        'DiagnosticReport',
        'DocumentReference'
      ],
      disclaimer: 'Prototype uses synthetic/de-identified healthcare data and is designed to integrate with authorized healthcare systems through standard FHIR APIs.'
    };
  }

  reset() {
    this.syntheticProvider.reset();
    this.fhirProvider.reset();
  }
}

// Singleton Instance
const healthcareDataProvider = new HealthcareDataProviderManager();

module.exports = healthcareDataProvider;
