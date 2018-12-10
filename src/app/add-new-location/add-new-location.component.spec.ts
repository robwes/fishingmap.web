import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewLocationComponent } from './add-new-location.component';

describe('AddNewLocationComponent', () => {
  let component: AddNewLocationComponent;
  let fixture: ComponentFixture<AddNewLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
