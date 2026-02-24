
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';
import PaymentPopup from "./PaymentPopup";

const config = require('./Apiconfig');

function Payment() {
  const [loading, setLoading] = useState(false);
  const [Client_code, setClient_code] = useState("");
  const [Company_or_Personal, setCompany_or_Personal] = useState("");
  const [CompanyName, setCompanyName] = useState("");
  const [Product, setProduct] = useState("");
  const [Address1, setAddress1] = useState("");
  const [Phone, setPhone] = useState("");
  const [Last_Payment, setLast_Payment] = useState("");
  const [Payment_type, setPayment_Type] = useState("");
  const [Payment_Date, setPayment_date] = useState("");
  const [paymenttypedrop, setPaymenttypeDrop] = useState([]);
  const [PaymentTypeDrop, setPaymentTypeDrop] = useState([]);
  const [Payment, setPayment] = useState('');
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [Live_Date, setLive_Date] = useState("");
  const [SelectedPayment_type, setselectedPaymentType] = useState("");
  const [error, setError] = useState("");
  const [rowDataTax, setRowDataTax] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const payment = permissions
    .filter(permission => permission.screen_type === 'payment')
    .map(permission => permission.permission_type.toLowerCase());

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const columnDefs = [
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 20;
        const showIcons = isWideEnough;
        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%', justifyContent: 'center' }}>
            {showIcons && (
              <>
                <span
                  className="icon mx-2"
                  onClick={() => saveEditedData(params.data)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-regular fa-floppy-disk"></i>
                </span>

                <span
                  className="icon mx-2"
                  onClick={() => deleteSelectedRows(params.data)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-trash"></i>
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'S.No',
      field: 'serialNumber',
      valueGetter: "node.rowIndex + 1",
      maxWidth: 80,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Payment Date",
      field: "Payment_Date",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Payment Type",
      field: "Payment_Type",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: PaymentTypeDrop,
      },
    },
    {
      headerName: "Payment",
      field: "Payment",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 50,
      },
    },
    {
      headerName: "Keyfield",
      field: "Keyfield",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
  ]

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    // flex: 1,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  const saveEditedData = async (rowData) => {
    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        try {
          const modified_by = sessionStorage.getItem('selectedUserCode');
          const company_code = sessionStorage.getItem("selectedCompanyCode");

          const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

          const response = await fetch(`${config.apiBaseUrl}/Client_PaymentUpdate `, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": company_code,
              "modified_by": modified_by
            },
            body: JSON.stringify(dataToSend)
          });

          if (response.ok) {
            toast.success("Data updated successfully");
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error Deleting Data: ' + error.message);
        }
      },
      () => {
        toast.info("Data updated cancelled.");
      }
    );
  };

  const deleteSelectedRows = async (rowData) => {
    const keyfieldToDelete = { keyfieldToDelete: Array.isArray(rowData) ? rowData : [rowData] };
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    showConfirmationToast(
      "Are you sure you want to delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/Client_PaymentDelete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": company_code,

            },
            body: JSON.stringify(keyfieldToDelete),
          });

          if (response.ok) {
            toast.success("Data deleted successfully");
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to delete data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error("Error deleting data: " + error.message);
        }
      },
      () => {
        toast.info("Data delete cancelled.");
      }
    );
  };

  const handleChangePaymentType = (selectedPay) => {
    setselectedPaymentType(selectedPay);
    setPayment_Type(selectedPay ? selectedPay.value : '');
  };

  const filteredOptionPaymentType = paymenttypedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/paytype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setPaymenttypeDrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/paytype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((data) => {
        const PaytypeOption = data.map((option) => option.attributedetails_name);
        setPaymentTypeDrop(PaytypeOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleSave = async () => {
    if (!Client_code || !Payment_Date || !Payment_type || !Payment) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    setLoading(true)
    try {
      const Header = {
        Client_code: Client_code,
        Payment_Date: Payment_Date,
        Payment_type: Payment_type,
        Payment: Payment || 0,
        Product_ID: Product,
        Company_code: sessionStorage.getItem('selectedCompanyCode'),
        created_by: sessionStorage.getItem('selectedUserCode')
      };
      const response = await fetch(`${config.apiBaseUrl}/Client_PaymentInsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        console.log("Data saved successfully!");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.error);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    setLoading(true)
    window.location.reload();
  };

  const handleExcelDownload = async () => {

    if (!Client_code || !Product) {
      toast.warning("Please select both Client and Product before generating the report");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/ClientPaymentExcel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Client_code: Client_code,
          Company_code: sessionStorage.getItem("selectedCompanyCode"),
          Product_ID: Product,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();

      if (!data || data.length === 0) {
        alert("No data available for export");
        return;
      }

      const wsData = [
        [],
        ["Company", data[0].CompanyName],
        ["Project", data[0].Product_ID],
        ["Live Date", new Date(data[0].Live_Date).toLocaleDateString()],
        ["Mode", data[0].Payment_Mode],
        [],
        ["Date", "Amount", "Paytype"],
      ];

      data.forEach((item) => {
        wsData.push([
          new Date(item.Payment_Date).toLocaleDateString(),
          item.Payment,
          item.Payment_type,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      Object.keys(ws).forEach((cell) => {
        if (cell[0] === "!") return;
        ws[cell].s = {
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
          alignment: { horizontal: "center", vertical: "center" },
        };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payment Data");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        "ClientPayment.xlsx"
      );
    } catch (error) {
      console.error("Excel generation error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRefNO(Client_code);
    }
  };

  const handleRefNO = async (Client_code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/GetClient_PaymentData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Client_code,
          Company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (response.ok) {
        const searchData = await response.json();

        // filter null rows
        const newRows = searchData
          .filter((item) => item.Payment_Date || item.Payment_Type || item.Payment)
          .map((matchedItem) => ({
            Payment_Date: matchedItem.Payment_Date
              ? formatDate(matchedItem.Payment_Date)
              : "",
            Payment_Type: matchedItem.Payment_Type || "",
            Payment: matchedItem.Payment || "",
            Notes: matchedItem.Notes || "",
            Keyfield: matchedItem.Keyfield || "",
          }));

        setRowData(newRows);

        // if (newRows.length > 0) {
        //   setSaveButtonVisible(false);
        //   setUpdateButtonVisible(true);
        // } else {
        //   setSaveButtonVisible(true);
        //   setUpdateButtonVisible(false);
        // }

        if (searchData.length > 0) {
          const firstItem = searchData[0];
          setClient_code(firstItem.Client_code);
          setCompany_or_Personal(firstItem.Company_or_Personal);
          setCompanyName(firstItem.CompanyName);
          setProduct(firstItem.Product);
          setAddress1(firstItem.Address1);
          setPhone(firstItem.Phone);
          setLast_Payment(formatDate(firstItem.Last_Payment));
          setLive_Date(formatDate(firstItem.Live_Date));
        }

        const uniqueProducts = [...new Set(searchData.map((item) => item.Product))];
        setProductOptions(uniqueProducts.map((p) => ({ value: p, label: p })));

        console.log("data fetched successfully:", searchData);
      } else if (response.status === 404) {
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to fetch data");
        setRowData([]);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching search data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDateString) => {
    if (!isoDateString || isoDateString === "1900-01-01T00:00:00" || isoDateString === "1900-01-01") {
      return "";
    }

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const generateReport = async () => {

    if (!Client_code || !Product) {
      toast.warning("Please select both Client and Product before generating the report");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/ClientPaymentExcel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Client_code: Client_code,
          Company_code: sessionStorage.getItem('selectedCompanyCode'),
          Product_ID: Product
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        alert("No data available for report");
        return;
      }

      // Take first row for header info
      const headerInfo = data[0];

      // Open new print window
      const reportWindow = window.open("", "_blank");
      reportWindow.document.write("<html><head><title>Payment Report</title>");
      reportWindow.document.write("<style>");
      reportWindow.document.write(`
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
            table { 
                width: 60%; 
                border-collapse: collapse; 
                margin: 20px auto; 
            }
            th, td {
                padding: 10px;
                text-align: left;
                border: 1px solid #ddd;
                vertical-align: top;
            }
            th {
                background-color: maroon;
                color: white;
                font-weight: bold;
            }
            td {
                background-color: #fdd9b5;
            }
            tr:nth-child(even) td {
                background-color: #fff0e1;
            }
            .header-table td { border: none; }
            .report-button {
                display: block;
                width: 150px;
                margin: 20px auto;
                padding: 10px;
                background-color: maroon;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 16px;
                text-align: center;
                border-radius: 5px;
            }
            @media print {
              .report-button { display: none; }
            }
          </style>
        `);
      reportWindow.document.write("</style></head><body>");

      // Header Info Table
      reportWindow.document.write("<table class='header-table'>");
      reportWindow.document.write(`
      <tr><td><b>Company</b></td><td>${headerInfo.CompanyName}</td></tr>
      <tr><td><b>Project</b></td><td>${headerInfo.Product_ID}</td></tr>
      <tr><td><b>Live Date</b></td><td>${headerInfo.Live_Date}</td></tr>
      <tr><td><b>Mode</b></td><td>${headerInfo.Payment_Mode}</td></tr>
    `);
      reportWindow.document.write("</table>");

      // Payment Details Table
      reportWindow.document.write("<table><thead><tr>");
      reportWindow.document.write("<th>Date</th><th>Amount</th><th>Paytype</th>");
      reportWindow.document.write("</tr></thead><tbody>");

      data.forEach((row) => {
        reportWindow.document.write(`
        <tr>
          <td>${row.Payment_Date}</td>
          <td>${row.Payment}</td>
          <td>${row.Payment_type}</td>
        </tr>
      `);
      });

      reportWindow.document.write("</tbody></table>");

      // Print Button
      reportWindow.document.write('<button class="report-button" onclick="window.print()">Print</button>');
      reportWindow.document.write("</body></html>");
      reportWindow.document.close();

    } catch (err) {
      console.error("Report Generation Error:", err);
      alert("Failed to generate report");
    }
  };

  const handleProduct = () => {
    setOpen(true);
  };

  const PaymentData = async (data) => {
    console.log(data)

    if (data && data.length > 0) {
      const [{ Client_code }] = data;

      await handleRefNO(Client_code)

    } else {
      console.log("Data not fetched...!");
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer position="top-right" className="toast-design" theme="colored" />
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut me-5">
                Payment
              </h1>
            </div>
            <div class="d-flex justify-content-end me-3">
              <savebutton className="purbut" onClick={handleSave} required title="Save">
                <i class="fa-regular fa-floppy-disk"></i>
              </savebutton>
              {/* {updateButtonVisible &&
                <savebutton className="purbut" onClick={Client_PaymentLoopUpdate} required title="Update">
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              }
              <delbutton onClick={handleDelete} required title="Delete">
                <i class="fa-solid fa-trash"></i>
              </delbutton> */}
              <printbutton className="purbut" title="print" onClick={generateReport}>
                <i class="fa-solid fa-file-pdf"></i>
              </printbutton>
              <printbutton className="purbut" title='Excel' onClick={handleExcelDownload}>
                <i class="fa-solid fa-file-excel"></i>
              </printbutton>
              <printbutton className="purbut" title='Reload' onClick={handleReload}>
                <i class="fa-solid fa-arrow-rotate-right"></i>
              </printbutton>
            </div>
          </div>
        </div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className="row ms-4 mb-3 mt-3 me-4">
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label htmlFor="cuscode" className="exp-form-labels">
                  Client Code
                </label>
                <div className="position-relative">
                  <input
                    id="cuscode"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Please fill the code here"
                    value={Client_code}
                    onChange={(e) => setClient_code(e.target.value)}
                    maxLength={18}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                    <span className="icon searchIcon" onClick={handleProduct}>
                      <i className="fa fa-search" ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="panno" class="exp-form-labels">
                  Company or Personal
                </label>
                <input
                  id="panno"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the Pan number here"
                  value={Company_or_Personal}
                  onChange={(e) => setCompany_or_Personal(e.target.value)}
                  maxLength={18}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusgst" class="exp-form-labels">
                  Company Name
                </label>
                <input
                  id="cusgst"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the GST number here"
                  value={CompanyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={15}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusaddr1" class="exp-form-labels">
                  Product
                </label>
                <Select
                  id="cusaddr1"
                  className="exp-input-field"
                  placeholder="Select Product"
                  required
                  title="Please select the product"
                  options={productOptions}
                  value={productOptions.find(option => option.value === Product) || null}
                  onChange={(selectedOption) => setProduct(selectedOption ? selectedOption.value : "")}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusstatcode" class="exp-form-labels">
                  Address
                </label>
                <input
                  id="cusstatcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the state here"
                  value={Address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="contactno" class="exp-form-labels">
                  Phone
                </label>
                <input
                  id="contactno"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the contact number here"
                  value={Phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cuscountrycode" class="exp-form-labels">
                  Last Payment
                </label>
                <input
                  id="cuscountrycode"
                  className="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  required title="Please fill the country here"
                  value={Last_Payment}
                  onChange={(e) => setLast_Payment(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <div class="d-flex justify-content-start">
                  <div> <label for="add2" class="exp-form-labels">
                    Live Date
                  </label> </div>
                  <div><span className="text-danger"></span></div>
                </div>
                <input
                  id="StartDate"
                  class="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  required title="Please Choose the Year"
                  value={Live_Date}
                  onChange={(e) => setLive_Date(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className="row ms-4 mb-3 mt-3 me-4">
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cuscode" class="exp-form-labels">
                  Payment Date
                </label><input
                  id="cuscode"
                  className="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  required title="Please fill the code here"
                  value={Payment_Date}
                  onChange={(e) => setPayment_date(e.target.value)}
                  maxLength={18}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2 ">
              <div class="exp-form-floating">
                <label for="cusweek" class="exp-form-labels">
                  Payment Type
                </label>
                <div title="Select the  Default Customer">
                  <Select
                    id="officeType"
                    value={SelectedPayment_type}
                    onChange={handleChangePaymentType}
                    options={filteredOptionPaymentType}
                    className="exp-input-field"
                    placeholder=""
                  // onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusarcode" class="exp-form-labels">
                  Payment
                </label><input
                  id="cusarcode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please fill the area here"
                  value={Payment === 0 ? "" : Payment}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === "" ? 0 : Number(val);
                    if (num >= 0) {
                      setPayment(num);
                    }
                  }}
                  min="0"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="cusarcode" class="exp-form-labels">
                  Product ID
                </label>
                <Select
                  id="cusarcode"
                  className="exp-input-field "
                  type="text"
                  placeholder=""
                  required title="Please fill the area here"
                  options={productOptions}
                  value={productOptions.find(option => option.value === Product) || null}
                  onChange={(selectedOption) => setProduct(selectedOption ? selectedOption.value : "")}
                  maxLength={100}
                  isDisabled={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div class="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              rowSelection="multiple"
              pagination={true}
              onSelectionChanged={onSelectionChanged}
              paginationAutoPageSize={true}
            />
          </div>
        </div>
        <PaymentPopup open={open} handleClose={handleClose} PaymentData={PaymentData} />
      </div>
    </div>
  );

}
export default Payment;