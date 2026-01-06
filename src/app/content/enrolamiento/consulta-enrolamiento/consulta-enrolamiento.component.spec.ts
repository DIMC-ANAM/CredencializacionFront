import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEnrolamientoComponent } from './consulta-enrolamiento.component';

describe('ConsultaEnrolamientoComponent', () => {
  let component: ConsultaEnrolamientoComponent;
  let fixture: ComponentFixture<ConsultaEnrolamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaEnrolamientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaEnrolamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
