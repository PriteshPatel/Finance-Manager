import { useEffect, useId, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, LoaderCircle, Plus, Trash2, Upload } from 'lucide-react';
import { API_BASE_URL } from '../../api-config';
import { EXPENSE_CATEGORIES } from './expense-manager';
import { INCOME_SOURCES } from './income-manager';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

type ImportKind = 'income' | 'expense';

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
}

interface ImportedRow {
  id: string;
  date: string;
  amount: string;
  description: string;
  classification: string;
  bankAccountId: string;
}

function parseDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }

  const text = String(value ?? '').trim();
  const isoDate = text.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoDate) {
    return `${isoDate[1]}-${isoDate[2].padStart(2, '0')}-${isoDate[3].padStart(2, '0')}`;
  }

  const localDate = text.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
  if (!localDate) return '';

  const year = localDate[3].length === 2
    ? Number(localDate[3]) < 70 ? `20${localDate[3]}` : `19${localDate[3]}`
    : localDate[3];

  return `${year}-${localDate[2].padStart(2, '0')}-${localDate[1].padStart(2, '0')}`;
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  const amountText = String(value ?? '').trim().replace(/[^\d.-]/g, '');
  return amountText ? Number(amountText) : Number.NaN;
}

function normalizeDescription(description: string): string {
  return description
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\d+/g, ' ')
    .replace(/[^\p{L}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function descriptionSimilarity(left: string, right: string): boolean {
  const normalizedLeft = normalizeDescription(left);
  const normalizedRight = normalizeDescription(right);
  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;

  const leftWords = new Set(normalizedLeft.split(' '));
  const rightWords = new Set(normalizedRight.split(' '));
  const sharedWords = [...leftWords].filter((word) => rightWords.has(word)).length;
  const wordSimilarity = sharedWords / (leftWords.size + rightWords.size - sharedWords);
  if (wordSimilarity >= 0.8) return true;

  const longest = normalizedLeft.length >= normalizedRight.length ? normalizedLeft : normalizedRight;
  const shortest = longest === normalizedLeft ? normalizedRight : normalizedLeft;
  if (shortest.length < 5 || longest.length - shortest.length > longest.length * 0.15) return false;

  let previousRow = Array.from({ length: shortest.length + 1 }, (_, index) => index);
  for (let rowIndex = 1; rowIndex <= longest.length; rowIndex += 1) {
    const currentRow = [rowIndex];
    for (let columnIndex = 1; columnIndex <= shortest.length; columnIndex += 1) {
      currentRow[columnIndex] = Math.min(
        currentRow[columnIndex - 1] + 1,
        previousRow[columnIndex] + 1,
        previousRow[columnIndex - 1] + (longest[rowIndex - 1] === shortest[columnIndex - 1] ? 0 : 1),
      );
    }
    previousRow = currentRow;
  }

  return 1 - previousRow[shortest.length] / longest.length >= 0.85;
}

function extractTransactions(rows: unknown[][], kind: ImportKind): ImportedRow[] {
  const amountHeaderPattern = kind === 'income' ? /deposit/ : /withdraw/;
  const headerIndex = rows.findIndex((row) => {
    const headers = row.map((cell) => String(cell ?? '').trim().toLowerCase());
    return headers.some((header) => /\bdate\b/.test(header))
      && headers.some((header) => /narr/.test(header))
      && headers.some((header) => amountHeaderPattern.test(header));
  });

  if (headerIndex < 0) {
    throw new Error(
      `Could not find Date, Narration, and ${kind === 'income' ? 'Deposit' : 'Withdrawal'} columns in the first worksheet. Check the transaction type and column headers.`,
    );
  }

  const headers = rows[headerIndex].map((cell) => String(cell ?? '').trim().toLowerCase());
  const dateIndex = headers.findIndex((header) => /\bdate\b/.test(header));
  const narrationIndex = headers.findIndex((header) => /narr/.test(header));
  const amountIndex = headers.findIndex((header) => amountHeaderPattern.test(header));
  const extracted: ImportedRow[] = [];

  rows.slice(headerIndex + 1).forEach((row, index) => {
    const date = parseDate(row[dateIndex]);
    if (!date) return;

    const amount = parseAmount(row[amountIndex]);
    if (!Number.isFinite(amount)) return;

    extracted.push({
      id: `${headerIndex + index + 1}-${extracted.length}`,
      date,
      amount: String(amount),
      description: String(row[narrationIndex] ?? '').trim(),
      classification: '',
      bankAccountId: '',
    });
  });

  if (extracted.length === 0) {
    throw new Error('No transaction rows were found below the headers in the first worksheet.');
  }

  return extracted;
}

function downloadCsv(rows: ImportedRow[], kind: ImportKind, accounts: BankAccount[]) {
  const classificationHeader = kind === 'income' ? 'Income Source' : 'Expense Category';
  const accountNames = new Map(accounts.map((account) => [account.id, account.accountName]));
  const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const content = [
    ['Date', 'Amount', 'Description', classificationHeader, 'Bank Account'],
    ...rows.map((row) => [
      row.date,
      row.amount,
      row.description,
      row.classification,
      accountNames.get(row.bankAccountId) || '',
    ]),
  ].map((line) => line.map(escapeCsv).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${kind}-transactions.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

interface StatementImageImportProps {
  accessToken: string;
  onTransactionSaved: () => void;
}

export function StatementImageImport({ accessToken, onTransactionSaved }: StatementImageImportProps) {
  const [kind, setKind] = useState<ImportKind>('income');
  const [workbookFile, setWorkbookFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [accountsError, setAccountsError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [savingRowId, setSavingRowId] = useState('');
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const inputId = useId();
  const sourceListId = useId();
  const categoryListId = useId();

  useEffect(() => {
    let active = true;
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error('Could not load bank accounts.');
        const data = await response.json();
        if (active) setAccounts(data.bankAccounts || []);
      } catch (fetchError) {
        if (active) {
          setAccountsError(
            fetchError instanceof Error ? fetchError.message : 'Could not load bank accounts.',
          );
        }
      }
    };

    fetchAccounts();
    return () => { active = false; };
  }, [accessToken]);

  const updateRow = (id: string, field: keyof ImportedRow, value: string) => {
    setRows((currentRows) => currentRows.map((row) => (
      row.id === id ? { ...row, [field]: value } : row
    )));
    setRowErrors((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const updateClassification = (id: string, value: string) => {
    const selectedRow = rows.find((row) => row.id === id);
    const selectedClassification = classificationOptions.find(
      (option) => option.toLowerCase() === value.trim().toLowerCase(),
    );
    if (!selectedRow || !selectedClassification) {
      updateRow(id, 'classification', value);
      return;
    }

    const matchingRowIds = new Set(rows
      .filter((row) => row.id === id || descriptionSimilarity(selectedRow.description, row.description))
      .map((row) => row.id));
    setRows((currentRows) => currentRows.map((row) => (
      matchingRowIds.has(row.id)
        ? { ...row, classification: selectedClassification }
        : row
    )));
    setRowErrors((current) => {
      const next = { ...current };
      matchingRowIds.forEach((rowId) => delete next[rowId]);
      return next;
    });
  };

  const addTransaction = async (row: ImportedRow) => {
    const amount = Number(row.amount);
    const classificationOptions = kind === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES;
    const classification = classificationOptions.find(
      (option) => option.toLowerCase() === row.classification.trim().toLowerCase(),
    );
    const selectedAccount = accounts.find((account) => account.id === row.bankAccountId);
    const validationErrors = [
      !row.date && 'Enter a transaction date.',
      !Number.isFinite(amount) || amount <= 0 ? 'Enter a positive amount.' : '',
      !classification && `Choose a valid ${kind === 'income' ? 'income source' : 'expense category'} from the list.`,
      !selectedAccount && 'Select a bank account.',
    ].filter(Boolean);

    if (validationErrors.length > 0) {
      setRowErrors((current) => ({
        ...current,
        [row.id]: validationErrors.join(' '),
      }));
      return;
    }

    if (!selectedAccount) {
      return;
    }

    setSavingRowId(row.id);
    setRowErrors((current) => {
      const next = { ...current };
      delete next[row.id];
      return next;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/${kind === 'income' ? 'income' : 'expenses'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(kind === 'income'
          ? {
            amount,
            source: classification,
            date: row.date,
            description: row.description,
            bankAccountId: selectedAccount.id,
            recurring: false,
          }
          : {
            amount,
            category: classification,
            date: row.date,
            description: row.description,
            bankAccountId: selectedAccount.id,
            recurring: false,
            tags: [],
          }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to add ${kind}.`);
      }

      setRows((currentRows) => currentRows.filter((currentRow) => currentRow.id !== row.id));
      onTransactionSaved();
    } catch (saveError) {
      setRowErrors((current) => ({
        ...current,
        [row.id]: saveError instanceof Error ? saveError.message : `Failed to add ${kind}.`,
      }));
    } finally {
      setSavingRowId('');
    }
  };

  const removeRow = (id: string) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
    setRowErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const selectWorkbook = (file?: File) => {
    setError('');
    setRows([]);
    if (!file) {
      setWorkbookFile(null);
      return;
    }

    if (!/\.xlsx$/i.test(file.name)) {
      setWorkbookFile(null);
      setError('Choose an .xlsx Excel workbook.');
      return;
    }
    setWorkbookFile(file);
  };

  const processWorkbook = async () => {
    if (!workbookFile) return;
    setError('');
    setProcessing(true);

    try {
      const workbook = XLSX.read(await workbookFile.arrayBuffer(), {
        type: 'array',
        cellDates: true,
      });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('The workbook does not contain any worksheets.');
      }

      const firstSheet = workbook.Sheets[firstSheetName];
      const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
        header: 1,
        defval: '',
        raw: true,
      });
      setRows(extractTransactions(sheetRows, kind));
    } catch (workbookError) {
      setError(workbookError instanceof Error ? workbookError.message : 'Could not read the Excel workbook.');
    } finally {
      setProcessing(false);
    }
  };

  const classificationLabel = kind === 'income' ? 'Income Source' : 'Expense Category';
  const classificationOptions = kind === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-4">
      <Card className="border-keyline shadow-xs">
        <CardHeader>
          <CardTitle className="d-flex align-items-center gap-2">
            <FileSpreadsheet className="app-h-5 app-w-5 fg-primary" />
            Import transactions from an Excel workbook
          </CardTitle>
          <CardDescription>
            Upload an .xlsx workbook. Transactions are read from its first worksheet; review and correct the results before exporting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="text-sm fw-medium me-2">Transaction type</span>
            <Button
              type="button"
              size="sm"
              variant={kind === 'income' ? 'default' : 'outline'}
              onClick={() => { setKind('income'); setRows([]); setError(''); }}
            >
              Income
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kind === 'expense' ? 'default' : 'outline'}
              onClick={() => { setKind('expense'); setRows([]); setError(''); }}
            >
              Expense
            </Button>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-md-end gap-3">
            <div className="flex-fill">
              <label htmlFor={inputId} className="form-label fw-medium">Excel workbook (.xlsx)</label>
              <Input
                id={inputId}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => selectWorkbook(event.target.files?.[0])}
                disabled={processing}
              />
            </div>
            <Button type="button" onClick={processWorkbook} disabled={!workbookFile || processing} className="gap-2">
              {processing
                ? <LoaderCircle className="app-h-4 app-w-4 animate-spin" />
                : <Upload className="app-h-4 app-w-4" />}
              {processing ? 'Reading workbook...' : 'Extract rows'}
            </Button>
          </div>

          {error && <p role="alert" className="text-sm fg-danger mb-0">{error}</p>}
          {accountsError && (
            <p role="status" className="text-sm fg-danger mb-0">
              {accountsError} Bank-account cells will remain unselected.
            </p>
          )}

          {workbookFile && (
            <div className="p-3 app-bg-muted-40 border border-keyline rounded-3">
              <div className="d-flex align-items-center gap-2 mb-2 text-sm fw-medium">
                <FileSpreadsheet className="app-h-4 app-w-4 fg-2" />
                {workbookFile.name}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card className="border-keyline shadow-xs">
          <CardHeader className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <CardTitle>Review extracted {kind}</CardTitle>
              <CardDescription>
                {rows.length} rows remaining. Add saves a transaction and updates its selected bank account; Delete removes it from this import.
              </CardDescription>
            </div>
            <div className="d-flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => downloadCsv(rows, kind, accounts)}
              >
                <Download className="app-h-4 app-w-4" />
                Export CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setRows([])}
              >
                <Trash2 className="app-h-4 app-w-4" />
                Clear rows
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <datalist id={sourceListId}>
              {INCOME_SOURCES.map((source) => <option key={source} value={source} />)}
            </datalist>
            <datalist id={categoryListId}>
              {EXPENSE_CATEGORIES.map((category) => <option key={category} value={category} />)}
            </datalist>
            <div className="w-100 overflow-auto rounded-2 border border-keyline">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>{classificationLabel}</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="min-w-140">
                        <Input
                          aria-label={`${classificationLabel} row date`}
                          value={row.date}
                          onChange={(event) => updateRow(row.id, 'date', event.target.value)}
                        />
                      </TableCell>
                      <TableCell className="min-w-140">
                        <Input
                          aria-label={`${classificationLabel} row amount`}
                          inputMode="decimal"
                          value={row.amount}
                          onChange={(event) => updateRow(row.id, 'amount', event.target.value)}
                        />
                      </TableCell>
                      <TableCell className="min-w-260">
                        <Input
                          aria-label={`${classificationLabel} row description`}
                          value={row.description}
                          onChange={(event) => updateRow(row.id, 'description', event.target.value)}
                        />
                      </TableCell>
                      <TableCell className="min-w-200">
                        <Input
                          aria-label={`${classificationLabel} row ${classificationLabel.toLowerCase()}`}
                          list={kind === 'income' ? sourceListId : categoryListId}
                          placeholder={`Search or enter ${classificationLabel.toLowerCase()}`}
                          value={row.classification}
                          onChange={(event) => updateClassification(row.id, event.target.value)}
                        />
                      </TableCell>
                      <TableCell className="min-w-200">
                        <Select
                          value={row.bankAccountId || 'none'}
                          onValueChange={(value) => updateRow(
                            row.id,
                            'bankAccountId',
                            value === 'none' ? '' : value,
                          )}
                        >
                          <SelectTrigger aria-label={`${classificationLabel} row bank account`}>
                            <SelectValue placeholder="No bank account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No bank account</SelectItem>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountName} ({account.bankName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="min-w-200">
                        <div className="d-flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="gap-1"
                            onClick={() => addTransaction(row)}
                            disabled={Boolean(savingRowId)}
                          >
                            {savingRowId === row.id
                              ? <LoaderCircle className="app-h-4 app-w-4 animate-spin" />
                              : <Plus className="app-h-4 app-w-4" />}
                            Add
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => removeRow(row.id)}
                            disabled={Boolean(savingRowId)}
                          >
                            <Trash2 className="app-h-4 app-w-4" />
                            Delete
                          </Button>
                        </div>
                        {rowErrors[row.id] && (
                          <p role="alert" className="text-xs fg-danger mt-2 mb-0">
                            {rowErrors[row.id]}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
