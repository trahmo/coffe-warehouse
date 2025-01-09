import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { DataBindingDirective } from "@progress/kendo-angular-grid";
import { MessageService } from "@progress/kendo-angular-l10n";
import { process } from "@progress/kendo-data-query";
import {
  SVGIcon,
  chevronDoubleUpIcon,
  questionCircleIcon,
  fileExcelIcon,
  filePdfIcon,
} from "@progress/kendo-svg-icons";
import { CustomMessagesService } from "../../services/custom-messages.service";
import { DialogAnimation } from "@progress/kendo-angular-dialog/dialog/models/dialog-animation";
import {
  NotificationRef,
  NotificationService,
  NotificationSettings,
} from "@progress/kendo-angular-notification";
import { DepartmentService } from "./department.service";
import { Subject, takeUntil } from "rxjs";
import { Department } from "./department";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-department",
  templateUrl: "./department.component.html",
})
export class DepartmentComponent implements OnInit, OnDestroy {
  @ViewChild(DataBindingDirective) dataBinding?: DataBindingDirective;

  department: Department = {} as Department;
  newDepartment: Department = {} as Department;
  public gridData: Department[] = [];
  public gridView: Department[] = [];
  public excelIcon: SVGIcon = fileExcelIcon;
  public pdfIcon: SVGIcon = filePdfIcon;
  public animation: boolean | DialogAnimation = {};
  public editForm: Department = {
    keyId: "",
    myName: "",
    myAge: 0,
    isActive: true,
  };
  public isAddNewVisible = false;
  public isEditDialogVisible = false;
  public mySelection: string[] = [];
  isDeleteDialogVisible = false;
  departmentToDelete: Department | null = null;
  currentDate: Date = new Date();
  public customMsgService: CustomMessagesService;
  departmentForm: FormGroup;

  @ViewChild("notification", { read: TemplateRef })
  public notificationTemplate: TemplateRef<any> = {} as TemplateRef<any>;
  public notificationReference: NotificationRef | undefined;
  public svgIcon: SVGIcon = questionCircleIcon;
  public closeIcon: SVGIcon = chevronDoubleUpIcon;
  public state: NotificationSettings = {
    content: "Your data has been saved.",
    type: { style: "success", icon: true },
    animation: { type: "slide", duration: 400 },
    hideAfter: 3000,
  };
  private subject = new Subject<void>();

  constructor(
    public msgService: MessageService,
    private fb: FormBuilder,
    private _DepartmentService: DepartmentService,
    private notificationService: NotificationService
  ) {
    this.customMsgService = this.msgService as CustomMessagesService;

    this.departmentForm = this.fb.group({
      myName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      myAge: [
        "",
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      currentDate: ["", Validators.required],
    });
  }

  public close(): void {
    if (this.notificationReference) {
      this.notificationReference.hide();
    }
  }

  public showStyledNotification(): void {
    this.notificationReference = this.notificationService.show({
      content: this.notificationTemplate,
      cssClass: "wrapper",
      animation: { type: "fade", duration: 200 },
      position: { horizontal: "right", vertical: "top" },
      hideAfter: 5000,
      width: 400,
    });
  }

  public showNotification(type: string): void {
    switch (type) {
      case "success":
        this.state.content = "Your data has been saved.";
        this.state.type = { style: "success", icon: true };
        break;
      case "error":
        this.state.content = "Oops, Department name or code already in use...";
        this.state.type = { style: "error", icon: true };
        break;
    }
    this.notificationService.show(this.state);
  }

  fieldValid = {
    datePicker: true,
    departmentName: true,
  };

  public ngOnInit(): void {
    this.getDepartmentData();
  }

  validateField(formValidator: any, field: string): void {
    if (field === "datePicker") {
      this.fieldValid.datePicker = !!this.currentDate;
    } else if (field === "departmentName") {
      const departmentNameControl = formValidator.form.get("departmentName");
      this.fieldValid.departmentName =
        departmentNameControl && departmentNameControl.valid;
    }
  }

  public onDepartmentChange(pageSize: number): void {
    const startIndex = 0;
    const endIndex = pageSize;
  }

  public onFilter(inputValue: string): void {
    this.gridView = process(this.gridData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "name",
            operator: "contains",
            value: inputValue,
          },
        ],
      },
    }).data as Department[];

    this.dataBinding ? (this.dataBinding.skip = 0) : null;
  }

  onAddNew() {
    this.isAddNewVisible = true;
  }

  public closeAddNewDialogue(): void {
    this.isAddNewVisible = false;
    this.departmentForm.reset({
      datepicker: this.currentDate,
      departmentName: "",
      departmentCode: "",
    });
  }

  onEdit(department: Department) {
    console.log(department);

    this.editForm = { ...department };
    this.isEditDialogVisible = true;
  }

  closeEditDialog() {
    this.isEditDialogVisible = false;
  }

  onSave() {
    const index = this.gridView.findIndex(
      (dept: Department) => dept.keyId === this.editForm.keyId
    );
    this._DepartmentService
      .updatedepartmentData(this.editForm, this.editForm.keyId)
      .subscribe({
        next: (Data) => {
          if (index !== -1) {
            this.gridView[index] = this.editForm;
            this.gridView = [...this.gridView];
            this.isEditDialogVisible = false;
          }
          this.showNotification("success");
          this.closeEditDialog();
        },
      });
  }

  onDelete(department: Department) {
    this.isDeleteDialogVisible = true;
    this.departmentToDelete = department;
  }
  closeDeleteDialog() {
    this.isDeleteDialogVisible = false;
  }
  confirmDelete() {
    if (this.departmentToDelete) {
      this._DepartmentService
        .deletedepartmentData(this.departmentToDelete.keyId)
        .subscribe({
          next: (res: any) => {
            this.gridView = this.gridView.filter(
              (obj) => obj.keyId !== this.departmentToDelete!.keyId
            );
          },
        });
      this.isDeleteDialogVisible = false;
    }
  }
  // Add New Department
  addDepartment() {
    Object.keys(this.departmentForm.controls).forEach((controlName) => {
      this.departmentForm.get(controlName)?.markAsTouched();
    });

    if (this.departmentForm.invalid) {
      return;
    }

    const index = this.gridData.findIndex(
      (dept) =>
        dept.myName === this.department.myName ||
        dept.myAge === this.department.myAge
    );

    if (index !== -1) {
      this.showNotification("error");
      return;
    }

    if (this.departmentForm.invalid) {
      return;
    }

    const newDepartment: Department = {
      keyId: "",
      myName: this.departmentForm.value.myName,
      myAge: this.departmentForm.value.myAge,
      isActive: true,
    };

    this._DepartmentService.adddepartmentData(newDepartment).subscribe({
      next: (res: any) => {
        // Handle the response as needed
        this.showNotification("success");
        this.closeAddNewDialogue();
      },
      error: (err) => {
        // Handle error
        this.showNotification("error");
      },
    });
  }
  // load Data
  getDepartmentData() {
    this._DepartmentService
      .getdepartmentData()
      .pipe(takeUntil(this.subject))
      .subscribe({
        next: (res: any) => {
          this.gridView = res.data;
        },
        error: (err: any) => {
          this.notificationService.show({
            content: "Error loading data: " + err.message,
            cssClass: "button-notification",
            hideAfter: 3000,
            animation: { type: "slide", duration: 400 },
            position: { horizontal: "center", vertical: "top" },
            type: { style: "error", icon: true },
          });
        },
      });
  }
  ngOnDestroy(): void {
    this.subject.next();
    this.subject.complete();
  }
}
