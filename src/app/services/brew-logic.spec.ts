import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { BrewLogicService } from './brew-logic';

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
});
