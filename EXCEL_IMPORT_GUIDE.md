# Excel Import Feature for Hosts/PIC Management

## Overview

This feature allows administrators to import host/PIC data from Excel files (.xlsx, .xls) or CSV files. The system automatically creates departments and roles if they don't exist.

## How to Use

### 1. Download Template

- Click the "Download Template" button to get a sample Excel file
- The template includes example data showing the correct format

### 2. Prepare Your Excel File

Your Excel file should contain the following columns (column names are case-insensitive):

| Column      | Aliases                                   | Required | Description                    |
| ----------- | ----------------------------------------- | -------- | ------------------------------ |
| name        | nama, full_name, fullName                 | Yes      | Full name of the host/PIC      |
| email       | EMAIL                                     | Yes      | Email address (must be unique) |
| phoneNumber | phone_number, phone, telepon, no_hp, nohp | No       | Phone number                   |
| department  | departemen, dept, division                | No       | Department name                |
| role        | jabatan, position, title                  | No       | Job role/position              |

### 3. Import Process

1. Click "Import Excel" button
2. Drag and drop your file or click to browse
3. Wait for processing to complete
4. Review the import results

## Features

### Automatic Creation

- **Departments**: If a department doesn't exist, it will be created automatically
- **Roles**: If a role doesn't exist, it will be created automatically

### Update Existing Records

- If an email already exists in the system, the record will be updated with new information
- No duplicate records will be created

### Error Handling

- Invalid email formats are rejected
- Missing required fields (name, email) are reported as errors
- File size limit: 5MB
- Supported formats: .xlsx, .xls, .csv

### Import Results

After import, you'll see:

- Total number of rows processed
- Number of new records created
- Number of existing records updated
- List of newly created departments
- List of newly created roles
- Any errors encountered with specific row numbers

## Example Excel File

```
| name | email | phoneNumber | department | role |
|------|-------|-------------|------------|------|
| Ahmad Sukarno | ahmad.sukarno@company.com | 08123456789 | IT Department | Software Engineer |
| Siti Nurhaliza | siti.nurhaliza@company.com | 08987654321 | Human Resources | HR Manager |
| Budi Santoso | budi.santoso@company.com | 08111222333 | Finance | Accountant |
```

## Technical Implementation

### Backend

- **Endpoint**: `POST /api/hosts/import`
- **Library**: `xlsx` for Excel parsing
- **File Upload**: `multer` with memory storage
- **Authentication**: Admin access required

### Frontend

- **Library**: `xlsx` for template generation
- **Upload Component**: Ant Design Upload.Dragger
- **State Management**: React Query for API calls

### Database Operations

- Uses Sequelize ORM transactions for data integrity
- Automatic relationship setup between hosts, departments, and roles
- Bulk operations for improved performance

## Error Codes and Messages

| Error                  | Description                         | Solution                                     |
| ---------------------- | ----------------------------------- | -------------------------------------------- |
| "No file uploaded"     | No file was selected                | Choose a valid Excel/CSV file                |
| "Excel file is empty"  | File has no data rows               | Add data to your Excel file                  |
| "Invalid email format" | Email doesn't match required format | Use valid email addresses                    |
| "Name is required"     | Missing name field                  | Ensure all rows have names                   |
| File size too large    | File exceeds 5MB limit              | Reduce file size or split into smaller files |

## Best Practices

1. **Test with small batches**: Start with a few records to test the format
2. **Backup your data**: Always backup existing data before large imports
3. **Validate emails**: Ensure all email addresses are valid and unique
4. **Check department/role names**: Use consistent naming for better organization
5. **Review results**: Always check the import results for any errors or issues

## Troubleshooting

### Common Issues

1. **Column names not recognized**: Use the exact column names from the template
2. **File format errors**: Ensure your file is saved as .xlsx, .xls, or .csv
3. **Upload fails**: Check file size (max 5MB) and internet connection
4. **Some records skipped**: Check error messages for specific row issues

### Getting Help

If you encounter issues:

1. Check the error messages in the import results
2. Verify your Excel file format matches the template
3. Ensure you have admin privileges
4. Contact your system administrator if problems persist
