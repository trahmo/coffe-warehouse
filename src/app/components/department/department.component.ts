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
  // public gridView: Department[] = [];
  public gridView: any[] = [];
  public excelIcon: SVGIcon = fileExcelIcon;
  public pdfIcon: SVGIcon = filePdfIcon;
  public animation: boolean | DialogAnimation = {};
  columns: any[] = [];
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
  isAddMode :boolean = false ; 
  isEditMode : boolean = false  ;

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
  public showNotification(type: string, msg: string): void {
    switch (type) {
      case "success":
        this.state.content = msg;
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
    //this.gridView = this.gridData.slice(25, 50);
    // this.gridView = this.gridData;


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
            field: this.getField,
            operator: "contains",
            value: inputValue,
          },
        ],
      },
    }).data;
    this.dataBinding ? (this.dataBinding.skip = 0) : null;
  }

  public getField = (args: Department) => {
    return `${args.myName}_${args.myAge}`;
  };

  onAddNew() {
    console.log("Abdelrahamn");
    
    this.isAddNewVisible = true;
  }

  public closeAddNewDialogue(): void {
    this.isEditMode = false;
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

  // onSave() {
  //   const index = this.gridView.findIndex(
  //     (dept: Department) => dept.keyId === this.editForm.keyId
  //   );
  //   this._DepartmentService
  //     .updatedepartmentData(this.editForm, this.editForm.keyId)
  //     .subscribe({
  //       next: (Data) => {
  //         if (index !== -1) {
  //           this.gridView[index] = this.editForm;
  //           this.gridView = [...this.gridView];
  //           this.isEditDialogVisible = false;
  //         }
  //         this.showNotification("success", this.customMsgService.translate("success"));
  //         this.closeEditDialog();
  //       },
  //     });
  // }

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
            this.showNotification("success", this.customMsgService.translate("success"));
            this.gridView = this.gridView.filter(
              (obj) => obj.keyId !== this.departmentToDelete!.keyId
            );
          },
        });
      this.isDeleteDialogVisible = false;
    }
  }
  // Add New Department
  // Add New Department
  currentKeyId : string  = ''; 
  openAddMode() {
    this.isEditMode = true;
    this.currentKeyId = '';
    this.departmentForm.reset();
  }
  openEditMode(item: Department) {
    this.isEditMode = true;
    this.currentKeyId = item.keyId;
  
    this.departmentForm.patchValue(item);
  }
  submitForm(departmentForm: FormGroup) {
    if (this.isEditMode && this.currentKeyId) {
      const index = this.gridView.findIndex(
        (dept: Department) => dept.keyId === this.currentKeyId
      );
      this._DepartmentService
        .updatedepartmentData(departmentForm.value, this.currentKeyId)
        .subscribe({
          next: (Data) => {
            if (index !== -1) {
              this.gridView[index] = departmentForm.value;
              this.gridView = [...this.gridView];
              this.isEditDialogVisible = false;
            }
            this.showNotification("success", this.customMsgService.translate("success"));
            this.isEditMode = false
          },
        });
    } else {
      
      const newDepartment: Department = { } as Department ;
          this._DepartmentService.adddepartmentData(newDepartment).subscribe({
            next: (res: any) => {
              this._DepartmentService.showRow(res.data.keyId).subscribe({
                next:(data :any)=>{
                  console.log("Data Of Row الجديد" ,  data);
                  console.log("Data Of Row الجديد" ,  data.data);
                  this.newDepartment = data.data ; 
                }
              })
              console.log(res);
              
               
              // newDepartment.created_at = res.data.created_at  ; 
              this.showNotification("success", this.customMsgService.translate("success"));
             
              this.gridView.push(newDepartment);
              this.gridView = [...this.gridView];
              this.isEditMode = false ; 
            },
            error: (err) => {
              // Handle error
              this.showNotification("error", this.customMsgService.translate("error"));
            },
          });
    }
  }


  // addDepartment() {
  //   Object.keys(this.departmentForm.controls).forEach((controlName) => {
  //     this.departmentForm.get(controlName)?.markAsTouched();
  //   });

  //   if (this.departmentForm.invalid) {
  //     return;
  //   }

  //   const newDepartment: Department = {
  //     keyId: "",
  //     myName: this.departmentForm.value.myName,
  //     myAge: this.departmentForm.value.myAge,
  //     isActive: true,
  //   };

  //   this._DepartmentService.adddepartmentData(newDepartment).subscribe({
  //     next: (res: any) => {
  //       newDepartment.keyId = res.data.keyId
  //       this.showNotification("success", this.customMsgService.translate("success"));
  //       this.closeAddNewDialogue();
  //       this.gridView.push(newDepartment);
  //       this.gridView = [...this.gridView];
  //     },
  //     error: (err) => {
  //       // Handle error
  //       this.showNotification("error", this.customMsgService.translate("error"));
  //     },
  //   });
  // }
  // load Data
  getDepartmentData() {
    this._DepartmentService
      .getdepartmentData()
      .pipe(takeUntil(this.subject))
      .subscribe({
        next: (res: any) => {
          console.log(res);
          
          if (res.data.length > 0) {
            const sampleRow = res.data[0];
            const columnsToRemove = ['keyId','nameEn','nameAr','updatedAt','updatedBy'];
            
            this.columns = Object.keys(sampleRow)
              .filter(key => !columnsToRemove.includes(key))
              .map(key => ({
                field: key,
                title: (key),
              }));
            this.gridView = res.data
            this.gridData = this.gridView ; 
          }
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
