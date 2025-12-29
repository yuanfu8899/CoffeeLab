import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { BrewLogicService } from './brew-logic';
import { BrewStep } from '../models/coffee.types';

describe('BrewLogicService', () => {
  let service: BrewLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(BrewLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEffectiveWaterTarget', () => {
    it('should return ratio-based target when waterEndTargetRatio is set', () => {
      const step: BrewStep = {
        name: '悶蒸',
        type: 'pour',
        waterEndTargetRatio: 2,
        duration: 30
      };
      const dose = 20;
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBe(40); // 20 * 2 = 40
    });

    it('should return absolute target when only waterEndTarget is set', () => {
      const step: BrewStep = {
        name: '第一段',
        type: 'pour',
        waterEndTarget: 120,
        duration: 40
      };
      const dose = 20;
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBe(120);
    });

    it('should prefer waterEndTargetRatio when both are set', () => {
      const step: BrewStep = {
        name: '測試',
        type: 'pour',
        waterEndTarget: 100,
        waterEndTargetRatio: 5,
        duration: 30
      };
      const dose = 20;
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBe(100); // 20 * 5 = 100, ratio takes precedence
    });

    it('should return undefined when neither target is set', () => {
      const step: BrewStep = {
        name: '等待',
        type: 'wait',
        duration: 30
      };
      const dose = 20;
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBeUndefined();
    });

    it('should round ratio-based calculations', () => {
      const step: BrewStep = {
        name: '測試',
        type: 'pour',
        waterEndTargetRatio: 6,
        duration: 30
      };
      const dose = 17; // 17 * 6 = 102
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBe(102);
    });

    it('should handle decimal ratios', () => {
      const step: BrewStep = {
        name: '測試',
        type: 'pour',
        waterEndTargetRatio: 2.5,
        duration: 30
      };
      const dose = 20; // 20 * 2.5 = 50
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBe(50);
    });
  });
});
