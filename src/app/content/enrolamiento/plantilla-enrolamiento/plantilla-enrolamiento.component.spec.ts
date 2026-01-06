import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaEnrolamientoComponent } from './plantilla-enrolamiento.component';

describe('PlantillaEnrolamientoComponent', () => {
  let component: PlantillaEnrolamientoComponent;
  let fixture: ComponentFixture<PlantillaEnrolamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantillaEnrolamientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantillaEnrolamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
