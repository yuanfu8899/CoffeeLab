import { TestBed } from '@angular/core/testing';

import { BrewLogic } from './brew-logic';

describe('BrewLogic', () => {
  let service: BrewLogic;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrewLogic);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
