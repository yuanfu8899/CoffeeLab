import { Injectable } from '@angular/core';
import { BrewMethod } from '../models/coffee.types';
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

  /**
   * Calculate the incremental water amount for a step (actual water to add in this step).
   * For the first step, incremental equals cumulative.
   * For subsequent steps, incremental = current cumulative - previous cumulative.
   *
   * @param steps - Complete list of brew steps
   * @param stepIndex - Index of the current step (0-based)
   * @param dose - Coffee dose in grams
   * @returns Incremental water amount in grams
   */
  getIncrementalWaterAmount(steps: BrewStep[], stepIndex: number, dose: number): number {
    if (stepIndex < 0 || stepIndex >= steps.length) return 0;

    const step = steps[stepIndex];
    const currentTarget = this.getEffectiveWaterTarget(step, dose);

    // If current step has no water target (e.g., wait step), incremental is 0
    if (currentTarget === undefined) return 0;

    // First step: incremental = cumulative
    if (stepIndex === 0) return currentTarget;

    // Subsequent steps: incremental = current - previous
    const previousTarget = this.getEffectiveWaterTarget(steps[stepIndex - 1], dose) || 0;
    return currentTarget - previousTarget;
  }

  /**
   * Calculate the incremental ratio for a step (ratio relative to dose for this step only).
   * For example, if cumulative ratios are [2, 6, 12, 15], incremental ratios are [2, 4, 6, 3].
   *
   * @param steps - Complete list of brew steps
   * @param stepIndex - Index of the current step (0-based)
   * @returns Incremental ratio, or undefined if step doesn't use ratio mode
   */
  getIncrementalRatio(steps: BrewStep[], stepIndex: number): number | undefined {
    if (stepIndex < 0 || stepIndex >= steps.length) return undefined;

    const step = steps[stepIndex];
    if (step.waterEndTargetRatio === undefined || step.waterEndTargetRatio === null) {
      return undefined;
    }

    // First step: incremental ratio = cumulative ratio
    if (stepIndex === 0) return step.waterEndTargetRatio;

    // Subsequent steps: incremental ratio = current ratio - previous ratio
    const previousRatio = steps[stepIndex - 1].waterEndTargetRatio || 0;
    return step.waterEndTargetRatio - previousRatio;
  }

  /**
   * Calculate the total water weight for a brew method.
   * Returns the cumulative water target of the last 'pour' step.
   *
   * @param method - The brew method
   * @param dose - Coffee dose in grams
   * @returns Total water weight in grams
   */
  getTotalWaterWeight(method: BrewMethod, dose: number): number {
    const pourSteps = method.steps.filter((s: BrewStep) => s.type === 'pour');
    if (pourSteps.length === 0) return 0;

    const lastPourStep = pourSteps[pourSteps.length - 1];
    return this.getEffectiveWaterTarget(lastPourStep, dose) || 0;
  }

  /**
   * Convert incremental ratios to cumulative ratios.
   * Used when user inputs incremental ratios and we need to store cumulative.
   * Example: [2, 4, 6, 3] → [2, 6, 12, 15]
   *
   * @param incrementalRatios - Array of incremental ratios
   * @returns Array of cumulative ratios
   */
  convertIncrementalToCumulative(incrementalRatios: number[]): number[] {
    const cumulative: number[] = [];
    let sum = 0;

    for (const ratio of incrementalRatios) {
      sum += ratio;
      cumulative.push(sum);
    }

    return cumulative;
  }
}
