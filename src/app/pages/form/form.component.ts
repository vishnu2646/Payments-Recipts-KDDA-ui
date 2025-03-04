import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MAT_DATE_LOCALE, MatNativeDateModule, MatOptionSelectionChange, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

import moment from 'moment';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { IExpenseType, IIncomeType } from '../../types/types';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: 'app-form',
    standalone: true,
    imports: [
        MatSelectModule,
        MatInputModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatButtonModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatNativeDateModule
    ],
    providers: [
        provideNativeDateAdapter(),
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    ],
    templateUrl: './form.component.html',
    styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
    private userService = inject(UserService);

    private apiService = inject(ApiService);

    private activatedRouter = inject(ActivatedRoute);

    private router = inject(Router);

    private user: { msg: String, token: { refresh: String, access: String } } = {} as { msg: String, token: { refresh: String, access: String } }

    public dataId: number = 0;

    public formType = ['Income', 'Expense'];

    public selectedType = 'Income';

    public options: IIncomeType[] = [];

    public expenseNameOptions: IExpenseType[] = [];

    public incomeModes: string[] = ['CASH', 'CHEQUE', 'DEMAND DRAFT', 'Transfer'];

    public expenseModes: string[] = ['CASH', 'CHEQUE', 'DEMAND DRAFT', 'Transfer'];

    public selectedIncomeMode: String = '';

    public selectedExpenseMode: String = '';

    public isBankDetailsVisible: boolean = false;

    public inputNameControl = new FormControl('');

    public filteredOptions: IIncomeType[] = [];

    public filteredExpenseNameOptions: IExpenseType[] = [];

    public toggleAddIncomeOption: boolean = false;

    public toggleAddExpenseOption: boolean = false;

    public type: string = '';

    public incomeForm = {
        incid: '',
        income_name: '',
        amount: 0,
        date: '',
        mode: '',
        reason: '',
        income_by: '',
        details: '',
        bankname: '',
        chequeordd: 0,
        dateinbank: ''
    }

    public expenseForm = {
        expid: '',
        expense_name: '',
        amount: 0,
        date: '',
        mode: '',
        reason: '',
        expense_by: '',
        details: '',
        bankname: '',
        chequeordd: 0,
        dateinbank: ''
    }

    constructor() {
        this.activatedRouter.queryParams.subscribe(params => {
            this.dataId = params['id'] || 0;
            this.type = params['type'] || '';
        });
    }

    public ngOnInit() {
        this.getUserDetails();
        this.handleGetIncomeTypes();
        if(this.dataId > 0) {
            if(this.type === 'income') {
                this.getIncomeDetailData();
            } else if(this.type === 'expense') {
                this.selectedType = 'Expense';
                this.getExpenseDetailData();
            }
        }
    }

    public getUserDetails() {
        const user = this.userService.getUserData();
        if(user) {
            this.user = user;
        }
    }

    public handleFormTypeChange(event: MatSelectChange) {
        this.selectedType = event.source.value;
        if(this.selectedType === 'Expense') {
            this.handleGetExpenseTypes();
        }
    }

    public handleIncomeModeChange(event?: MatSelectChange) {
        if(event) {
            this.selectedIncomeMode = event.source.value;
        }

        this.incomeForm.mode = this.selectedIncomeMode.toString();

        if(this.incomeForm.mode === 'CASH') {
            this.isBankDetailsVisible = false;
        } else {
            this.isBankDetailsVisible = true;
        }
    }

    public handleExpenseModeChange(event?: MatSelectChange) {
        if(event) {
            this.selectedExpenseMode = event.source.value;
        }

        this.expenseForm.mode = this.selectedExpenseMode.toString();
        if(this.expenseForm.mode === 'CASH') {
            this.isBankDetailsVisible = false;
        } else {
            this.isBankDetailsVisible = true;
        }
    }

    public getIncomeDetailData() {
        this.apiService.getIncomeDetailsService(this.dataId, this.user).subscribe({
            next: (response: any) => {
                this.incomeForm = response;
                if(this.incomeForm.mode.includes('Transfer')) {
                    this.selectedIncomeMode = 'Transfer';
                    this.handleIncomeModeChange();
                } else if(this.incomeForm.mode.includes('Cash')) {
                    this.selectedIncomeMode = 'CASH';
                    this.handleIncomeModeChange();
                } else if (this.incomeForm.mode.includes('Cheque')) {
                    this.selectedIncomeMode = 'CHEQUE'
                    this.handleIncomeModeChange();
                } else if(this.selectedIncomeMode.includes('demand draft')) {
                    this.selectedIncomeMode = 'DEMAND DRAFT';
                    this.handleIncomeModeChange();
                }
                const date = this.convertStringToDate(response.date);
                const dateinbank = this.convertStringToDate(response.dateinbank);
                this.incomeForm.date = new Date(date) as unknown as string;
                this.incomeForm.dateinbank = new Date(dateinbank) as unknown as string;
            },
            error: (error: Error) => {
                console.log(error);
            },
            complete: () => {
                console.log('completed');
            }
        });
    }

    public getExpenseDetailData() {
        this.apiService.handleGetExpenseDetailService(this.dataId, this.user).subscribe({
            next: (response: any) => {
                console.log(response);
                this.expenseForm = response;
                if(this.expenseForm.mode.includes('Transfer')) {
                    this.selectedExpenseMode = 'Transfer';
                    this.handleExpenseModeChange();
                } else if(this.expenseForm.mode.includes('Cash')) {
                    this.selectedExpenseMode = 'CASH';
                    this.handleExpenseModeChange();
                } else if (this.expenseForm.mode.includes('Cheque')) {
                    this.selectedExpenseMode = 'CHEQUE'
                    this.handleExpenseModeChange();
                } else if(this.selectedIncomeMode.includes('demand draft')) {
                    this.selectedExpenseMode = 'DEMAND DRAFT';
                    this.handleExpenseModeChange();
                }

                const date = this.convertStringToDate(response.date);
                const dateinbank = this.convertStringToDate(response.dateinbank);
                this.expenseForm.date = new Date(date) as unknown as string;
                this.expenseForm.dateinbank = new Date(dateinbank) as unknown as string;
            },
            error: (error: Error) => {
                console.log(error);
            },
            complete: () => {
                console.log('completed');
            }
        });
    }

    public handleSaveIncome() {
        this.incomeForm.date = moment(this.incomeForm.date).format('yyyy-MM-DD');
        this.incomeForm.dateinbank = moment(this.incomeForm.dateinbank).format('yyyy-MM-DD');

        this.apiService.handleCreateIncome(this.incomeForm, this.user).subscribe({
            next: (responseData) => {
                if(responseData === 'Income saved successfully') {
                    alert(responseData);
                }
            },
            error: (error) => {
                console.log(error);
            },
            complete: () => {
                console.log("complted...");
                this.handleResetIncomeForm();
            }
        });
    }

    public handleUpdateIncomeForm() {
        this.incomeForm.date = moment(this.incomeForm.date).format('yyyy-MM-DD');
        this.incomeForm.dateinbank = moment(this.incomeForm.dateinbank).format('yyyy-MM-DD');

        this.apiService.handleUpdateIncomeService(this.dataId, this.user, this.incomeForm).subscribe({
            next: (response) => {
                console.log(response);
                alert(response);
                this.router.navigate(['/dashboard/data']);
            },
            error: (error: Error) => {
                console.log(error);
            },
            complete: () => {
                console.log('complete');
            }
        })
    }

    public handleUpdateExpenseForm() {
        this.expenseForm.date = moment(this.expenseForm.date).format('yyyy-MM-DD');
        this.expenseForm.dateinbank = moment(this.expenseForm.dateinbank).format('yyyy-MM-DD');

        this.apiService.handleUpdateExpenseService(this.dataId, this.user, this.expenseForm).subscribe({
            next: (response) => {
                alert(response);
                this.router.navigate(['/dashboard/data']);
            },
            error: (error: Error) => {
                console.log(error);
            },
            complete: () => {
                console.log('complete');
            }
        })
    }

    public handleSaveExpense() {
        if (moment(this.expenseForm.date).isValid()) {
            this.expenseForm.date = moment(this.expenseForm.date).format('yyyy-MM-DD');
        } else {
            this.expenseForm.date = '';
        }

        if (moment(this.expenseForm.dateinbank).isValid()) {
            this.expenseForm.dateinbank = moment(this.expenseForm.dateinbank).format('yyyy-MM-DD');
        } else {
            this.expenseForm.dateinbank = '';
        }

        this.apiService.handleCreateExpense(this.expenseForm, this.user).subscribe({
            next: (responseData) => {
                if(responseData === 'Expense saved successfully') {
                    alert(responseData)
                }
            },
            error: (error) => {
                console.log(error);
            },
            complete: () => {
                console.log('completed');
                this.handleResetExpenseForm();
            }
        });
    }

    public handleFilterIncomeNames(event: any) {
        this.filteredOptions = this._filter(event);
        if(this.filteredOptions.length === 0) {
            this.toggleAddIncomeOption = true;
        } else {
            this.toggleAddIncomeOption = false;
        }
    }

    public handleFilterExpenseNames(event: String) {
        this.filteredExpenseNameOptions = this._filterExpenseOptions(event.toString().toLowerCase())

        if(this.filteredExpenseNameOptions.length === 0) {
            this.toggleAddExpenseOption = true;
        } else {
            this.toggleAddExpenseOption = false;
        }
    }

    public handleCreateIncomeType() {

        const type = {
            typeid: this.options.length + 1,
            typename: this.incomeForm.income_name
        }

        this.apiService.handleCreateIncomeTypeService(type, this.user).subscribe({
            next: (responseData) => {
                if(responseData) {
                    this.handleGetIncomeTypes();
                }
            },
            error: (error) => {
                console.log(error)
            },
            complete: () => {

                this.toggleAddIncomeOption = !this.toggleAddIncomeOption;
                this.handleResetIncomeForm();
            }
        });
    }

    public handleCreateExpenseType() {

        const type = {
            etypeid: this.expenseNameOptions.length + 1,
            etypename: this.expenseForm.expense_name
        }

        this.apiService.handleCreateExpenseTypeService(type, this.user).subscribe({
            next: (responseData) => {
                if(responseData) {
                    this.handleGetExpenseTypes();
                }
            },
            error: (error) => {
                console.log(error)
            },
            complete: () => {
                this.toggleAddExpenseOption = !this.toggleAddExpenseOption;
                this.handleResetExpenseForm();
            }
        });
    }

    private handleGetIncomeTypes() {
        this.apiService.handleGetIncomeTypeService(this.user).subscribe({
            next: (responseData) => {
                this.options = responseData
            },
            error: (error) => {
                console.log(error);
            },
            complete: () => {
                console.log('completed')
            }
        })
    }

    private handleGetExpenseTypes() {
        this.apiService.handleGetExpenseTypeService(this.user).subscribe({
            next: (responseData) => {
                this.expenseNameOptions = responseData
            },
            error: (error) => {
                console.log(error);
            },
            complete: () => {
                console.log("completed")
            }
        })
    }

    private _filter(value: string): IIncomeType[] {
        const filterValue = value.toLowerCase();
        if(!filterValue) {
            return this.options;
        } else {
            return this.options.filter(option => option.typename.toLowerCase().includes(filterValue));
        }
    }

    private _filterExpenseOptions(value: string): IExpenseType[] {
        const filterValue = value.toLowerCase();
        if(!filterValue) {
            return this.expenseNameOptions;
        } else {
            return this.expenseNameOptions.filter(option => option.etypename.toLowerCase().includes(filterValue));
        }
    }

    private handleResetIncomeForm() {
        this.incomeForm = {
            incid: '',
            income_name: '',
            amount: 0,
            date: '',
            mode: '',
            reason: '',
            income_by: '',
            details: '',
            bankname: '',
            chequeordd: 0,
            dateinbank: ''
        }
    }

    private handleResetExpenseForm() {
        this.expenseForm = {
            expid: '',
            expense_name: '',
            amount: 0,
            date: '',
            mode: '',
            reason: '',
            expense_by: '',
            details: '',
            bankname: '',
            chequeordd: 0,
            dateinbank: ''
        }
    }

    private convertStringToDate(dateStr: string): Date {
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}`);  // Convert to YYYY-MM-DD format
      }
}
