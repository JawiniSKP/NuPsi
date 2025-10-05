import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndicatorsPage } from './indicators.page';

describe('IndicatorsPage', () => {
  let component: IndicatorsPage;
  let fixture: ComponentFixture<IndicatorsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicatorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
