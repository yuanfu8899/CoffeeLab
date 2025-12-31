import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { BrewLogicService } from './brew-logic';
import { BrewStep, BrewMethod } from '../models/coffee.types';

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
        waterEndTarget: 150,
        waterEndTargetRatio: 5,
        duration: 30
      };
      const dose = 20;
      const result = service.getEffectiveWaterTarget(step, dose);
      expect(result).toBe(100); // 20 * 5 = 100, ratio takes precedence over absolute 150
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

  describe('getIncrementalWaterAmount', () => {
    it('should return cumulative amount for first step', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 }
      ];
      const result = service.getIncrementalWaterAmount(steps, 0, 20);
      expect(result).toBe(40); // First step: incremental = cumulative = 20 * 2
    });

    it('should calculate incremental amount for subsequent steps', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 },
        { name: '第一段', type: 'pour', waterEndTargetRatio: 6, duration: 40 },
        { name: '第二段', type: 'pour', waterEndTargetRatio: 12, duration: 40 }
      ];
      const dose = 20;

      // Second step: 120 - 40 = 80
      expect(service.getIncrementalWaterAmount(steps, 1, dose)).toBe(80);

      // Third step: 240 - 120 = 120
      expect(service.getIncrementalWaterAmount(steps, 2, dose)).toBe(120);
    });

    it('should handle mixed ratio and absolute steps', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTarget: 40, duration: 30 },
        { name: '第一段', type: 'pour', waterEndTarget: 120, duration: 40 }
      ];
      const dose = 20;

      expect(service.getIncrementalWaterAmount(steps, 0, dose)).toBe(40);
      expect(service.getIncrementalWaterAmount(steps, 1, dose)).toBe(80); // 120 - 40
    });

    it('should return 0 for out of bounds index', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 }
      ];

      expect(service.getIncrementalWaterAmount(steps, -1, 20)).toBe(0);
      expect(service.getIncrementalWaterAmount(steps, 5, 20)).toBe(0);
    });

    it('should handle wait steps (no water target)', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 },
        { name: '等待', type: 'wait', duration: 30 },
        { name: '第一段', type: 'pour', waterEndTargetRatio: 6, duration: 40 }
      ];
      const dose = 20;

      expect(service.getIncrementalWaterAmount(steps, 1, dose)).toBe(0); // Wait step
    });
  });

  describe('getIncrementalRatio', () => {
    it('should return cumulative ratio for first step', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 }
      ];
      expect(service.getIncrementalRatio(steps, 0)).toBe(2);
    });

    it('should calculate incremental ratio for subsequent steps', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 },
        { name: '第一段', type: 'pour', waterEndTargetRatio: 6, duration: 40 },
        { name: '第二段', type: 'pour', waterEndTargetRatio: 12, duration: 40 },
        { name: '第三段', type: 'pour', waterEndTargetRatio: 15, duration: 40 }
      ];

      expect(service.getIncrementalRatio(steps, 0)).toBe(2);   // 2
      expect(service.getIncrementalRatio(steps, 1)).toBe(4);   // 6 - 2
      expect(service.getIncrementalRatio(steps, 2)).toBe(6);   // 12 - 6
      expect(service.getIncrementalRatio(steps, 3)).toBe(3);   // 15 - 12
    });

    it('should return undefined for steps without ratio', () => {
      const steps: BrewStep[] = [
        { name: '第一段', type: 'pour', waterEndTarget: 120, duration: 40 }
      ];
      expect(service.getIncrementalRatio(steps, 0)).toBeUndefined();
    });

    it('should return undefined for out of bounds index', () => {
      const steps: BrewStep[] = [
        { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 }
      ];
      expect(service.getIncrementalRatio(steps, -1)).toBeUndefined();
      expect(service.getIncrementalRatio(steps, 5)).toBeUndefined();
    });

    it('should handle decreasing ratios (negative incremental)', () => {
      const steps: BrewStep[] = [
        { name: '第一段', type: 'pour', waterEndTargetRatio: 10, duration: 30 },
        { name: '第二段', type: 'pour', waterEndTargetRatio: 8, duration: 40 }
      ];
      expect(service.getIncrementalRatio(steps, 1)).toBe(-2); // 8 - 10 = -2
    });
  });

  describe('getTotalWaterWeight', () => {
    it('should return total water weight from last pour step', () => {
      const method: BrewMethod = {
        id: 'test',
        name: 'Test Method',
        category: 'drip',
        recommendedTemp: 92,
        recommendedRatio: 15,
        steps: [
          { name: '悶蒸', type: 'pour', waterEndTargetRatio: 2, duration: 30 },
          { name: '第一段', type: 'pour', waterEndTargetRatio: 6, duration: 40 },
          { name: '第二段', type: 'pour', waterEndTargetRatio: 12, duration: 40 },
          { name: '等待', type: 'wait', duration: 30 },
          { name: '第三段', type: 'pour', waterEndTargetRatio: 15, duration: 40 }
        ]
      };
      const dose = 20;
      const result = service.getTotalWaterWeight(method, dose);
      expect(result).toBe(300); // Last pour step: 20 * 15 = 300
    });

    it('should return 0 for method with no pour steps', () => {
      const method: BrewMethod = {
        id: 'test',
        name: 'Test Method',
        category: 'drip',
        recommendedTemp: 92,
        recommendedRatio: 15,
        steps: [
          { name: '等待', type: 'wait', duration: 30 }
        ]
      };
      expect(service.getTotalWaterWeight(method, 20)).toBe(0);
    });

    it('should handle absolute water targets', () => {
      const method: BrewMethod = {
        id: 'test',
        name: 'Test Method',
        category: 'drip',
        recommendedTemp: 92,
        recommendedRatio: 15,
        steps: [
          { name: '第一段', type: 'pour', waterEndTarget: 100, duration: 40 },
          { name: '第二段', type: 'pour', waterEndTarget: 250, duration: 40 }
        ]
      };
      const dose = 20;
      expect(service.getTotalWaterWeight(method, dose)).toBe(250);
    });
  });

  describe('convertIncrementalToCumulative', () => {
    it('should convert incremental ratios to cumulative', () => {
      const incremental = [2, 4, 6, 3];
      const result = service.convertIncrementalToCumulative(incremental);
      expect(result).toEqual([2, 6, 12, 15]);
    });

    it('should handle single element array', () => {
      const incremental = [5];
      const result = service.convertIncrementalToCumulative(incremental);
      expect(result).toEqual([5]);
    });

    it('should handle empty array', () => {
      const incremental: number[] = [];
      const result = service.convertIncrementalToCumulative(incremental);
      expect(result).toEqual([]);
    });

    it('should handle decimal ratios', () => {
      const incremental = [2.5, 3.5, 4];
      const result = service.convertIncrementalToCumulative(incremental);
      expect(result).toEqual([2.5, 6, 10]);
    });
  });
});
