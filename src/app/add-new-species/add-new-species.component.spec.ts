import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSpeciesComponent } from './add-new-species.component';

describe('AddNewSpeciesComponent', () => {
  let component: AddNewSpeciesComponent;
  let fixture: ComponentFixture<AddNewSpeciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewSpeciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewSpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
