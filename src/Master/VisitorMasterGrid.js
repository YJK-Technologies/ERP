import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "../apps.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../test.css";
import labels from "../Labels";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showConfirmationToast } from "../ToastConfirmation";
import LoadingScreen from "../Loading";
import Select from "react-select";
import * as XLSX from "xlsx";
const config = require("../Apiconfig");

function VisitorMasterGrid() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [visitorId, setVisitorId] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [status, setStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusDrop, setStatusDrop] = useState([]);
  const [idProofType, setIdProofType] = useState("");
  const [selectedIdProofType, setSelectedIdProofType] = useState("");
  const [idProofTypeDrop, setIdProofTypeDrop] = useState([]);
  const [idProofNo, setIdProofNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [selectedCustomerType, setSelectedCustomerType] = useState("");
  const [customerTypeDrop, setCustomerTypeDrop] = useState([]);
  const [IdProofTyprDrop, setidProofTypeDrop] = useState([]);
  const [CustomerTypeDrop, setcustomerTypeDrop] = useState([]);
  const [StatusDrop, setstatusDrop] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");
  const [visitorNo, setVisitorNo] = useState('');
  const [fromExpiryDate, setFromExpiryDate] = useState('');
  const [toExpiryDate, setToExpiryDate] = useState('');

  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || {};
  const visitorMasterPermission = permissions
    .filter((permission) => permission.screen_type === "VisitorMaster")
    .map((permission) => permission.permission_type.toLowerCase());

  const reloadGridData = () => {
    window.location.reload();
  };

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => {
        setStatusDrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          setSelectedStatus(firstOption);
          setStatus(firstOption.value);
        }

      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/getIdProofType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setIdProofTypeDrop(val))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/getCustomerType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setCustomerTypeDrop(val))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((data) => {
        const statusOption = data.map((option) => option.attributedetails_name);
        setstatusDrop(statusOption);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/getIdProofType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((data) => {
        const idProofTypeOption = data.map((option) => option.attributedetails_name);
        setidProofTypeDrop(idProofTypeOption);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/getCustomerType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((data) => {
        const customerTypeOption = data.map((option) => option.attributedetails_name);
        setcustomerTypeDrop(customerTypeOption);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const filteredOptionStatus = statusDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionIdProofType = idProofTypeDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionCustomerType = customerTypeDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleChangeIdProofType = (selectedIdProofType) => {
    setSelectedIdProofType(selectedIdProofType);
    setIdProofType(selectedIdProofType ? selectedIdProofType.value : "");
  };

  const handleChangeCustomerType = (selectedOptions) => {
    setSelectedCustomerType(selectedOptions);

    if (!selectedOptions || selectedOptions.length === 0) {
      setCustomerType("");
      return;
    }

    const values = selectedOptions.map(opt => opt.value);

    setCustomerType(values.join(","));
  };

  const handleSearch = async () => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/VisitorMasterSearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Visitor_ID: visitorId,
          Visitor_Name: visitorName,
          ID_Proof: idProofType,
          ID_Proof_No: idProofNo,
          Company_Name: companyName,
          Customer_type: customerType,
          Status: status,
          company_code,
          Phone_No: visitorNo,
          FromDate: fromExpiryDate,
          ToDate: toExpiryDate
        }),
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message, {
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Visitor Id",
      field: "Visitor_ID",
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 18,
      },
      cellRenderer: (params) => {
        const handleClick = () => {
          handleNavigateWithRowData(params.data);
        };

        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Visitor Name",
      field: "Visitor_Name",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Contact Number",
      field: "Phone_No",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Id Proof Type",
      field: "ID_Proof",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        maxLength: 18,
        values: IdProofTyprDrop,
      },
    },
    {
      headerName: "Id Proof No",
      field: "ID_Proof_No",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Company Name",
      field: "Company_Name",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Customer Type",
      field: "Customer_type",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        maxLength: 18,
        values: CustomerTypeDrop,
      },
    },
    {
      headerName: "Expiry Date",
      field: "Expired_Date",
      editable: true,
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        if (!params.data?.Expired_Date) return "";
        return params.data.Expired_Date.split("T")[0];
      },
    },
    {
      headerName: "Status",
      field: "Status",
      editable: true,
      cellStyle: { textAlign: "center" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        maxLength: 18,
        values: StatusDrop,
      },
    },
    {
      headerName: "Keyfield",
      field: "Keyfield",
      cellStyle: { textAlign: "center" },
      cellEditorParams: {
        maxLength: 250,
      },
      hide: true,
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const reportData = selectedRows.map((row) => {
      return {
        "Visitor Id": row.Visitor_ID,
        "Visitor Name": row.Visitor_Name,
        "Mobile Number": row.Phone_No,
        "Id Proof Type": row.ID_Proof,
        "Id Proof No": row.ID_Proof_No,
        "Company Name": row.Company_Name,
        "Customer Type": row.Customer_type,
        "Expired Date": formatDate(row.Expired_Date),
        "Status": row.Status,
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Visitor Master</title>");
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
      body {
          font-family: Arial, sans-serif;
          margin: 20px;
      }
      h1 {
          color: maroon;
          text-align: center;
          font-size: 24px;
          margin-bottom: 30px;
          text-decoration: underline;
      }
      table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
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
      .report-button:hover {
          background-color: darkred;
      }
      @media print {
          .report-button {
              display: none;
          }
          body {
              margin: 0;
              padding: 0;
          }
      }
    `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write("<h1><u>Visitor Master</u></h1>");

    // Create table with headers
    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

    // Populate the rows
    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value}</td>`);
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");

    reportWindow.document.write(
      '<button class="report-button" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const handleNavigatesToForm = () => {
    navigate("/AddVisitorMaster", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
  };
  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddVisitorMaster", { state: { mode: "update", selectedRow } });
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  // Assuming you have a unique identifier for each row, such as 'id'
  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Keyfield === params.data.Keyfield
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const isValidDateStrict = (dateStr) => {
    if (!dateStr) return true; // allow empty / null

    // Accept only yyyy-mm-dd
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    // Ensure no auto-correction (Feb 31 → Mar 2)
    const [y, m, d] = dateStr.split("-").map(Number);
    return (
      date.getFullYear() === y &&
      date.getMonth() + 1 === m &&
      date.getDate() === d
    );
  };

  const saveEditedData = async () => {
    const selectedRowsData = editedData.filter((row) =>
      selectedRows.some((selectedRow) => selectedRow.Keyfield === row.Keyfield)
    );

    if (selectedRowsData.length === 0) {
      toast.warning(
        "Please select and modify at least one row to update its data"
      );
      return;
    }

    for (const row of selectedRowsData) {
      const expiry = row.Expired_Date
        ? row.Expired_Date.split("T")[0] // handle ISO format
        : null;

      if (expiry && !isValidDateStrict(expiry)) {
        toast.error(
          `Invalid Expiry Date (${expiry}) for visitor: ${row.Visitor_Name}`
        );
        return; // ⛔ STOP SAVE COMPLETELY
      }
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        setLoading(true);
        try {

          const response = await fetch(`${config.apiBaseUrl}/VisitorMasterGridUpdate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Modified_by": sessionStorage.getItem("selectedUserCode"),
                "company_code": sessionStorage.getItem('selectedCompanyCode'),
              },
              body: JSON.stringify({ editedData: selectedRowsData }), // Send only the selected rows for saving
            }
          );
          if (response.status === 200) {
            setTimeout(() => {
              toast.success("Data Updated Successfully");
              handleSearch();
            }, 1000);
            return;
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to Update");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Updating Data: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data updated cancelled.");
      }
    );
  };

  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      toast.warning("Please select atleast One Row to Delete")
      return;
    }

    const keyfieldsToDelete = selectedRows.map((row) => row.Keyfield);
    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(`${config.apiBaseUrl}/VisitorMasterDelete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": sessionStorage.getItem('selectedCompanyCode'),
            },
            body: JSON.stringify({
              deletedData: keyfieldsToDelete,
            }),
          });

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data Deleted successfully")
              handleSearch();
            }, 1000);
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to delete  ");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error Deleting Data: ' + error.message);
        } finally {
          setLoading(false);
        }

      },
      () => {
        toast.info("Data Delete cancelled.");
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return 'N/A' if the date is missing
    const date = new Date(dateString);

    // Format as DD/MM/YYYY
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    const formattedCreatedDate = formatDate(rowData.created_date);
    const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };

  // Handler for when a row is selected
  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  };

  const transformData = (data) => {
    return data.map(row => ({
      "Visitor Id": row.Visitor_ID,
      "Visitor Name": row.Visitor_Name,
      "Mobile Number": row.Phone_No,
      "Id Proof Type": row.ID_Proof,
      "Id Proof No": row.ID_Proof_No,
      "Company Name": row.Company_Name,
      "Customer Type": row.Customer_type,
      "Expired Date": formatDate(row.Expired_Date),
      "Status": row.Status,
    }));
  };

  const handleExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['Visitor Master'],
    ];

    const transformedData = transformData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitor Master');
    XLSX.writeFile(workbook, 'Visitor_Master.xlsx');
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer
          position="top-right"
          className="toast-design"
          theme="colored"
        />
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut">
                Search Visitor Master
              </h1>
            </div>

            <div className="d-flex justify-content-end purbut me-3">
              {["add", "all permission"].some((permission) =>
                visitorMasterPermission.includes(permission)
              ) && (
                  <addbutton
                    className="purbut"
                    onClick={handleNavigatesToForm}
                    required
                    title="Add"
                  >
                    <i class="fa-solid fa-user-plus"></i>{" "}
                  </addbutton>
                )}
              {["delete", "all permission"].some((permission) =>
                visitorMasterPermission.includes(permission)
              ) && (
                  <delbutton
                    className="purbut"
                    onClick={deleteSelectedRows}
                    required
                    title="Delete"
                  >
                    <i class="fa-solid fa-user-minus"></i>
                  </delbutton>
                )}
              {["update", "all permission"].some((permission) =>
                visitorMasterPermission.includes(permission)
              ) && (
                  <savebutton
                    className="purbut"
                    onClick={saveEditedData}
                    required
                    title="Update"
                  >
                    <i class="fa-solid fa-floppy-disk"></i>
                  </savebutton>
                )}
              {["all permission", "view"].some((permission) =>
                visitorMasterPermission.includes(permission)
              ) && (
                  <printbutton
                    class="purbut"
                    onClick={generateReport}
                    required
                    title="Generate Report"
                  >
                    <i class="fa-solid fa-print"></i>
                  </printbutton>
                )}
              <addbutton
                class="purbut"
                onClick={handleExcel}
                required
                title="Excel Export"
              >
                <i class="fa-solid fa-file-excel"></i>
              </addbutton>
            </div>

            <div class="mobileview">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start ">
                  <h1 align="left" className="h1 me-5">
                    Visitor Master
                  </h1>
                </div>

                <div class="dropdown mt-1 me-5 " style={{ paddingLeft: -5 }}>
                  <button
                    class="btn btn-primary dropdown-toggle p-1 "
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu ">
                    <li class="iconbutton d-flex justify-content-center text-success">
                      {["add", "all permission"].some((permission) =>
                        visitorMasterPermission.includes(permission)
                      ) && (
                          <icon class="icon" onClick={handleNavigatesToForm}>
                            <i class="fa-solid fa-user-plus"></i>
                          </icon>
                        )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-danger">
                      {["delete", "all permission"].some((permission) =>
                        visitorMasterPermission.includes(permission)
                      ) && (
                          <icon
                            class="icon"
                            onClick={deleteSelectedRows}
                          >
                            <i class="fa-solid fa-user-minus"></i>
                          </icon>
                        )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {["update", "all permission"].some((permission) =>
                        visitorMasterPermission.includes(permission)
                      ) && (
                          <icon class="icon" onClick={saveEditedData}>
                            <i class="fa-solid fa-floppy-disk"></i>
                          </icon>
                        )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center ">
                      {["all permission", "view"].some((permission) =>
                        visitorMasterPermission.includes(permission)
                      ) && (
                          <icon
                            class="icon"
                            onClick={generateReport}
                          >
                            <i class="fa-solid fa-print"></i>
                          </icon>
                        )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className="row ms-4 mt-3 mb-3 me-4">
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="locno" class="exp-form-labels">
                  Visitor Id
                </label>
                <input
                  id="depID"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={visitorId}
                  maxLength={18}
                  onChange={(e) => setVisitorId(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  Visitor Name
                </label>
                <input
                  id="depName"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={visitorName}
                  maxLength={18}
                  onChange={(e) => setVisitorName(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  Contact Number
                </label>
                <input
                  id="depName"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={visitorNo}
                  maxLength={18}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setVisitorNo(value)
                  }}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label class="exp-form-labels">Id Proof Type</label>
                <Select
                  id="status"
                  value={selectedIdProofType}
                  onChange={handleChangeIdProofType}
                  options={filteredOptionIdProofType}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  Id Proof No
                </label>
                <input
                  id="depName"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={idProofNo}
                  maxLength={18}
                  onChange={(e) => setIdProofNo(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  From Expiry Date
                </label>
                <input
                  id="depName"
                  className="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  required
                  value={fromExpiryDate}
                  onChange={(e) => setFromExpiryDate(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  To Expiry Date
                </label>
                <input
                  id="depName"
                  className="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  required
                  value={toExpiryDate}
                  onChange={(e) => setToExpiryDate(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label class="exp-form-labels">Customer Type</label>
                <Select
                  id="status"
                  value={selectedCustomerType}
                  onChange={handleChangeCustomerType}
                  options={filteredOptionCustomerType}
                  className="exp-input-field"
                  placeholder=""
                  isMulti
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label class="exp-form-labels">Status</label>
                <Select
                  id="status"
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  options={filteredOptionStatus}
                  className="exp-input-field"
                  placeholder=""
                />
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label for="lname" class="exp-form-labels">
                  Company Name
                </label>
                <input
                  id="depName"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  maxLength={30}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group d-flex justify-content-end mt-3">
              <div class="exp-form-floating">
                <div class=" d-flex  justify-content-center">
                  <div class="">
                    <icon
                      className="popups-btn fs-6 p-3"
                      required
                      title="Search"
                      onClick={handleSearch}
                    >
                      <i className="fas fa-search"></i>
                    </icon>
                  </div>
                  <div>
                    <icon
                      className="popups-btn fs-6 p-3"
                      onClick={reloadGridData}
                      required
                      title="Refresh"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ag-theme-alpine" style={{ height: 450, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              rowSelection="multiple"
              pagination={true}
              paginationAutoPageSize={true}
              onSelectionChanged={onSelectionChanged}
              onCellValueChanged={onCellValueChanged}
              onRowSelected={onRowSelected}
            />
          </div>
        </div>
      </div>

      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              {labels.createdBy}: {createdBy}
            </p>
            <p className="col-md-">
              {labels.createdDate} : {createdDate}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              {labels.modifiedBy} : {modifiedBy}
            </p>
            <p className="col-md-6">
              {labels.modifiedDate} : {modifiedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisitorMasterGrid;
