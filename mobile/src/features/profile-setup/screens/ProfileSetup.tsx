import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../../../app/navigation/types';
import { GenderSelection } from './GenderSelection';
import { LifestyleSelection } from './LifestyleSelection';
import { StylePreferences } from './StylePreferences';
import { PermissionsSetup } from './PermissionsSetup';

const TOTAL_STEPS = 4;
const LAST_STEP_INDEX = 3;

type Gender = 'kadin' | 'erkek';

export function ProfileSetup() {
  const navigation = useNavigation<AppNavigationProp>();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender>('kadin');

  const finishProfileSetup = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const goBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((s) => s - 1);
  };

  const goNext = () => {
    if (step === LAST_STEP_INDEX) {
      finishProfileSetup();
      return;
    }
    setStep((s) => s + 1);
  };

  const skip = () => {
    finishProfileSetup();
  };

  if (step === 1) {
    return (
      <LifestyleSelection
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onContinue={goNext}
        onSkip={skip}
      />
    );
  }

  if (step === 2) {
    return (
      <StylePreferences
        gender={gender}
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onContinue={goNext}
        onSkip={skip}
      />
    );
  }

  if (step === 3) {
    return (
      <PermissionsSetup
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onContinue={goNext}
        onSkip={skip}
      />
    );
  }

  return (
    <GenderSelection
      step={step}
      totalSteps={TOTAL_STEPS}
      onBack={goBack}
      onContinue={(selectedGender) => {
        setGender(selectedGender);
        goNext();
      }}
      onSkip={skip}
    />
  );
}
