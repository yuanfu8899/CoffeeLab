import { Injectable } from '@angular/core';
import { BrewStep } from '../models/coffee.types';

@Injectable({
  providedIn: 'root'
})
export class BrewLogicService {

  constructor() { }

  calculate(beanWeight: number, roast: 'light' | 'medium' | 'dark') {
    let ratio = 15;
    let temp = 90;

    switch (roast) {
      case 'light':
        ratio = 16;
        temp = 92;
        break;
      case 'medium':
        ratio = 15;
        temp = 90;
        break;
      case 'dark':
        ratio = 13;
        temp = 85;
        break;
    }

    return {
      waterWeight: beanWeight * ratio,
      temperature: temp,
      ratio: `1:${ratio}`
    };
  }

  /**
   * Calculate the effective cumulative water target for a brew step.
   * If the step has a waterEndTargetRatio, it calculates dose * ratio.
   * Otherwise, it returns the absolute waterEndTarget.
   * 
   * @param step - The brew step
   * @param dose - The coffee dose in grams
   * @returns The effective cumulative water target in grams, or undefined if neither field is set
   */
  getEffectiveWaterTarget(step: BrewStep, dose: number): number | undefined {
    if (step.waterEndTargetRatio !== undefined && step.waterEndTargetRatio !== null) {
      return Math.round(dose * step.waterEndTargetRatio);
    }
    return step.waterEndTarget;
  }
}
