import { TestBed } from '@angular/core/testing';

import { Repository } from './repository';

describe('Repository', () => {
  let service: Repository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Repository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
