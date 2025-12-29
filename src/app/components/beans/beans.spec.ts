import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Beans } from './beans';

describe('Beans', () => {
  let component: Beans;
  let fixture: ComponentFixture<Beans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Beans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Beans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
