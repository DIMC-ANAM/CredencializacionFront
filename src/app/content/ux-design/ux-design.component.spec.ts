import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UxDesignComponent } from './ux-design.component';

describe('UxDesignComponent', () => {
  let component: UxDesignComponent;
  let fixture: ComponentFixture<UxDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UxDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UxDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
