export class Department {
  public id?: number;
  public name?: string;
  public code?: string;
  public selected? = false;
}

export var departmentData: Department[] = [
  { id: 1, name: "HR", code: "HR001", selected: false },
  { id: 2, name: "IT", code: "IT001", selected: false },
  { id: 4, name: "Marketing", code: "MKT001", selected: false },
  { id: 3, name: "Finance", code: "FIN001", selected: false },
  { id: 5, name: "Operations", code: "OPS001", selected: false },
  { id: 6, name: "Legal", code: "LEG001", selected: false },
  { id: 7, name: "Sales", code: "SAL001", selected: false },
  { id: 8, name: "Customer Support", code: "CS001", selected: false },
  { id: 9, name: "R&D", code: "RD001", selected: false },
  { id: 10, name: "Admin", code: "ADM001", selected: false },
];
