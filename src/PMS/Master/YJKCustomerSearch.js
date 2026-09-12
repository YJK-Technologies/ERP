import React, { useState, useEffect } from "react";
import { showConfirmationToast } from "../../ToastConfirmation";
import LoadingScreen from "../../Loading";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';

const YJKCustomerScreen = () => {
    const config = require('../../Apiconfig');

    // Grid Data State
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Filter Input States
    const [customerName, setCustomerName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [regarding, setRegarding] = useState("");
    const [url, setUrl] = useState("");
    const location = useLocation();
    const [From_RenewalExpired, setFrom_RenewalExpired] = useState("");
    const [To_RenewalExpired, setTo_RenewalExpired] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [status, setStatus] = useState("");
    const [statusDrop, setStatusDrop] = useState([]);
    const [gridApi, setGridApi] = useState(null);

    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        fetch(`${config.apiBaseUrl}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
        })
            .then((data) => data.json())
            .then((val) => setStatusDrop(val))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const filteredOptionStatus = statusDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    //code added by Harish purpose of set user permisssion
    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
    const YjkCustomerPermission = permissions
        .filter(permission => permission.screen_type === 'YjkCustomer')
        .map(permission => permission.permission_type.toLowerCase());

    useEffect(() => {
        const handleKeyDown = (event) => {
            const isReloadShortcut =
                (event.ctrlKey && event.key.toLowerCase() === "r") ||
                (event.altKey && event.key.toLowerCase() === "r") ||
                event.key === "F5";

            if (isReloadShortcut) {
                event.preventDefault();
                clearInputFields();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        // if (location.state?.preservedRowData) {
        //   setRowData(location.state.preservedRowData);
        // }

        if (location.state?.preservedInputs) {
            const inputs = location.state.preservedInputs;

            setCustomerName(inputs.customerName || "");
            setCompanyName(inputs.companyName || "");
            setPhone(inputs.phone || "");
            setEmail(inputs.email || "");
            setRegarding(inputs.regarding || "");
            setUrl(inputs.url || "");
            setFrom_RenewalExpired(inputs.From_RenewalExpired || "");
            setTo_RenewalExpired(inputs.setTo_RenewalExpired || "");
            setStatus(inputs.status || "");
            if (inputs.status) {
                setSelectedStatus({
                    label: inputs.status,
                    value: inputs.status,
                });
            }

            if (location.state?.refreshGrid) {
                handleSearch(inputs);
            }
        }
    }, [location.state]);


    const columnDefs = [
    {
        headerCheckboxSelection: true,
      checkboxSelection: true,
        headerName: "Customer ID",
        field: "customer_id",
        editable: false
    },
    {
        headerName: "Customer Name",
        field: "customer_name",
        editable: true
    },
    {
        headerName: "Company Name",
        field: "company_name",
        editable: true
    },
    {
        headerName: "Phone",
        field: "phone",
        editable: true
    },
    {
        headerName: "Email",
        field: "email",
        editable: true
    },
    {
        headerName: "Regarding",
        field: "regarding",
        editable: true
    },
    {
        headerName: "URL",
        field: "url",
        editable: true
    },
    {
        headerName: "Demo Status",
        field: "demo_status",
        editable: true
    },
    {
        headerName: "Feedback",
        field: "feedback",
        editable: true
    },
    {
        headerName: "Website URL",
        field: "website_url",
        editable: true
    },
    {
        headerName: "Website Date",
        field: "website_date",
        editable: true
    },
    {
        headerName: "No of Users",
        field: "no_of_users",
        editable: true
    },
    {
        headerName: "Reference",
        field: "reference",
        editable: true
    },
    {
        headerName: "Live Date",
        field: "live_date",
        editable: true
    },
    {
        headerName: "Amount",
        field: "amount",
        editable: true
    },
    {
        headerName: "New Requirement 1",
        field: "new_requirement_1",
        editable: true
    },
    {
        headerName: "New Requirement 2",
        field: "new_requirement_2",
        editable: true
    },
    {
        headerName: "Development Status",
        field: "development_status",
        editable: true
    },
    {
        headerName: "Status",
        field: "status",
        editable: true
    },
    {
        headerName: "Website Renewal",
        field: "WebsiteRenewal",
        editable: true
    },
    {
        headerName: "Renewal Reminder",
        field: "RenewalRemaider",
        editable: true
    },
    {
        headerName: "Renewal Expired",
        field: "RenewalExpired",
        editable: true
    }
];

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const defaultColDef = {
        editable: true,
        sortable: true,
        resizable: true,
        wrapText: true,
    };

    const handleSearch = async (searchParams = null) => {
        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/getYJKcustomer_Details`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer_name: searchParams?.customerName ?? customerName,
                    company_name: searchParams?.companyName ?? companyName,
                    phone: searchParams?.phone ?? phone,
                    email: searchParams?.email ?? email,
                    regarding: searchParams?.regarding ?? regarding,
                    url: searchParams?.url ?? url,
                    From_RenewalExpired: searchParams?.From_RenewalExpired ?? From_RenewalExpired,
                    To_RenewalExpired: searchParams?.To_RenewalExpired ?? To_RenewalExpired,
                    status: searchParams?.status ?? status,
                    company_code: sessionStorage.getItem('selectedCompanyCode'),

                })
            });
            if (response.ok) {
                const searchData = await response.json();
                setRowData(searchData);
                console.log("Data fetched successfully");
            } else if (response.status === 404) {
                console.log("Data not found");
                toast.warning("Data not found")
                setRowData([]);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert sales data");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error("Error updating data: " + error.message);
        }
        finally {
            setLoading(false);
        }
    };

    const clearInputFields = () => {
        setCustomerName("");
        setCompanyName("");
        setPhone("");
        setEmail("");
        setRegarding("");
        setUrl("");
        setFrom_RenewalExpired("");
        setTo_RenewalExpired("");
        setStatus("");
        setSelectedStatus("");
        setRowData([]);
    };
    const handleChangeStatus = (selectedStatus) => {
        setSelectedStatus(selectedStatus);
        setStatus(selectedStatus ? selectedStatus.value : '');
    };

    const handleNavigateToForm = () => {
        navigate("/AddYjkCustomer", { state: { mode: "create" } }); // Pass selectedRows as props to the Input component
    };

 const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddYjkCustomer", {
        state: {
            mode: "update",
            customer_id: selectedRow.customer_id,

            preservedInputs: {
                customerName,
                companyName,
                phone,
                email,
                regarding,
                url,
                From_RenewalExpired,
                To_RenewalExpired,
                status
            }
        }
    });
};

const handleUpdate = () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length !== 1) {
        toast.warning("Please select one customer to update");
        return;
    }

    const selectedRow = selectedRows[0];

    showConfirmationToast(
        "Are you sure you want to update the selected customer?",
        async () => {
            setLoading(true);

            try {
                const modified_by =
                    sessionStorage.getItem("selectedUserCode");

                const company_code =
                    sessionStorage.getItem("selectedCompanyCode");

                const payload = {
                    customer_id: selectedRow.customer_id,
                    customer_name: selectedRow.customer_name,
                    company_name: selectedRow.company_name,
                    phone: selectedRow.phone,
                    email: selectedRow.email,
                    regarding: selectedRow.regarding,
                    url: selectedRow.url,
                    demo_status: selectedRow.demo_status,
                    feedback: selectedRow.feedback,
                    website_url: selectedRow.website_url,
                    website_date: selectedRow.website_date,
                    no_of_users: selectedRow.no_of_users,
                    reference: selectedRow.reference,
                    live_date: selectedRow.live_date,
                    amount: selectedRow.amount,
                    new_requirement_1: selectedRow.new_requirement_1,
                    new_requirement_2: selectedRow.new_requirement_2,
                    development_status: selectedRow.development_status,
                    status: selectedRow.status,
                    WebsiteRenewal: selectedRow.WebsiteRenewal,
                    RenewalRemaider: selectedRow.RenewalRemaider,
                    RenewalExpired: selectedRow.RenewalExpired,
                    company_code: company_code,
                    modified_by: modified_by,
                    modified_date: new Date()
                };

                console.log("Update Customer Payload:", payload);

                const response = await fetch(
                    `${config.apiBaseUrl}/YJKcustomer_DetailsUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                const result = await response.json();

                if (response.status === 200) {
                    toast.success(
                        result.message || "Customer data updated successfully"
                    );

                    handleSearch();
                } else {
                    toast.warning(
                        result.message || "Failed to update customer data"
                    );
                }

            } catch (error) {
                console.error("Error updating customer:", error);

                toast.error(
                    "Error Updating Data: " + error.message
                );
            } finally {
                setLoading(false);
            }
        },
        () => {
            toast.info("Data update cancelled.");
        }
    );
};
const handleDelete = async () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
        toast.warning("Please select at least one customer to delete");
        return;
    }

    const confirmDelete = window.confirm(
        "Are you sure you want to delete the selected customer?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        setLoading(true);

        const company_code =
            sessionStorage.getItem("selectedCompanyCode");

        const modified_by =
            sessionStorage.getItem("selectedUserCode");

        for (const row of selectedRows) {

            const payload = {
                mode: "D",
                customer_id: row.customer_id,

                customer_name: "",
                company_name: "",
                phone: "",
                email: "",
                regarding: "",
                url: "",
                demo_status: "",
                feedback: "",
                website_url: "",
                website_date: "",
                no_of_users: 0,
                reference: "",
                live_date: "",
                amount: 0,
                new_requirement_1: "",
                new_requirement_2: "",
                development_status: "",
                status: "",
                WebsiteRenewal: "",
                RenewalRemaider: "",
                RenewalExpired: "",

                company_code: company_code,

                created_by: "",
                created_date: "",

                modified_by: modified_by,
                modified_date: "",

                From_RenewalExpired: "",
                To_RenewalExpired: ""
            };

            const response = await fetch(
                `${config.apiBaseUrl}/getYJKcustomer_Details`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete customer"
                );
            }
        }

        toast.success("Customer deleted successfully");

        handleSearch();

    } catch (error) {
        console.error("Delete Customer Error:", error);
        toast.error(error.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
};

    const generateReport = () => {
        const selectedRows = gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
            toast.warning("Please select at least one row to generate a report");
            return
        };

        const reportData = selectedRows.map((row) => {
            const safeValue = (val) => (val !== undefined && val !== null ? val : '');

            return {
                "Customer ID": safeValue(row.customer_id),
                "Customer Name": safeValue(row.customer_name),
                "Company Name": safeValue(row.company_name),
                "Phone": safeValue(row.phone),
                "Email": safeValue(row.email),
                "Regarding": safeValue(row.regarding),
                "URL": safeValue(row.url),
                "Demo Status": safeValue(row.demo_status),
                "Feedback": safeValue(row.feedback),
                "Website URL": safeValue(row.website_url),
                "Website Date": safeValue(row.website_date),
                "No of Users": safeValue(row.no_of_users),
                "Reference": safeValue(row.reference),
                "Live Date": safeValue(row.live_date),
                "Amount": safeValue(row.amount),
                "New Requirement 1": safeValue(row.new_requirement_1),
                "New Requirement 2": safeValue(row.new_requirement_2),
                "Development Status": safeValue(row.development_status),
                "Status": safeValue(row.status),
                "Website Renewal": safeValue(row.WebsiteRenewal),
                "Renewal Reminder": safeValue(row.RenewalRemaider),
                "Renewal Expired": safeValue(row.RenewalExpired),
            };
        });

        const reportWindow = window.open("", "_blank");
        reportWindow.document.write("<html><head><title>YJK Customer</title>");
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
        reportWindow.document.write("<h1><u>YJK Customer Report</u></h1>");

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
            '<button class="report-button" title="Print" onclick="window.print()">Print</button>'
        );
        reportWindow.document.write("</body></html>");
        reportWindow.document.close();
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            {/* Header Bar */}
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                <div className="d-flex justify-content-between">
                    <div className="d-flex justify-content-start">
                        <h1 align="left" className="purbut me-5">
                            YJK Customer
                        </h1>
                    </div>
                    <div className="d-flex justify-content-end purbut me-3">
                        {['add', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                            <addbutton className="" title="Add New Customer" onClick={handleNavigateToForm}>
                                <i className="fa-solid fa-user-plus"></i>
                            </addbutton>
                        )}
                        {['delete', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                            <delbutton className="purbut" title="Delete Selected Customer"onClick={handleDelete}>
                                <i className="fa-solid fa-user-minus"></i>
                            </delbutton>
                        )}
                        {['update', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                            <savebutton className="purbut" title="Update Customer Records"onClick={handleUpdate}>
                                <i className="fa-solid fa-floppy-disk"></i>
                            </savebutton>
                        )}
                        {['all permission', 'view'].some(permission => YjkCustomerPermission.includes(permission)) && (
                            <printbutton className="purbut" onClick={generateReport} title="Generate Customer Report">
                                <i className="fa-solid fa-print"></i>
                            </printbutton>
                        )}
                    </div>

                    <div class="mobileview">
                        <div class="d-flex justify-content-between">
                            <div className="d-flex justify-content-start">
                                <h1 align="left" className="h1" >YJK Customer</h1>
                            </div>

                            <div class="dropdown mt-1 me-5">
                                <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fa-solid fa-list"></i>
                                </button>

                                <ul class="dropdown-menu menu">

                                    <li class="iconbutton d-flex justify-content-center text-success">
                                        {['add', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon" onClick={handleNavigateToForm}>
                                                <i class="fa-solid fa-user-plus"></i>
                                            </icon>
                                        )}
                                    </li>
                                    <li class="iconbutton  d-flex justify-content-center text-danger">
                                        {['delete', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon"onClick={handleDelete}>
                                                <i class="fa-solid fa-user-minus"></i>
                                            </icon>
                                        )}
                                    </li>
                                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                                        {['update', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon"onClick={handleUpdate}>
                                                <i class="fa-solid fa-floppy-disk"></i>
                                            </icon>
                                        )}
                                    </li>
                                    <li class="iconbutton  d-flex justify-content-center ">
                                        {['all permission', 'view'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon" onClick={generateReport}>
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

            {/* Filter / Search Controls Section */}
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                <div className="row ms-4 mb-3 mt-3 me-4">
                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Customer Name</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter Customer Name"
                                title="Search by Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Company Name</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter Company Name"
                                title="Search by Company Name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Phone</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter Phone"
                                title="Search by Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Email</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter Email"
                                title="Search by Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Regarding</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter Regarding"
                                title="Search by Subject / Regarding"
                                value={regarding}
                                onChange={(e) => setRegarding(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">URL</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter URL"
                                title="Search by Project or Website URL"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">RenewalExpired From</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter URL"
                                title="Search by Project or Website URL"
                                value={From_RenewalExpired}
                                onChange={(e) => setFrom_RenewalExpired(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mb-2">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">RenewalExpired To</label>
                            <input
                                className="exp-input-field form-control"
                                placeholder="Enter URL"
                                title="Search by Project or Website URL"
                                value={To_RenewalExpired}
                                onChange={(e) => setTo_RenewalExpired(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>
                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Status</label>
                            <Select
                                className="exp-input-field"
                                options={filteredOptionStatus}
                                placeholder="Select Status"
                                title="Select overall customer account status"
                                value={selectedStatus}
                                onChange={handleChangeStatus}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group mt-4">
                        <div className="exp-form-floating">
                            <div className="d-flex justify-content-center">
                                <div>
                                    <icon className="popups-btn fs-6 p-3" onClick={handleSearch} title="Click to Search">
                                        <i className="fas fa-search"></i>
                                    </icon>
                                </div>
                                <div>
                                    <icon className="popups-btn fs-6 p-3" onClick={clearInputFields} title="Click to Reset / Refresh Filters">
                                        <i className="fa-solid fa-arrow-rotate-right"></i>
                                    </icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        paginationAutoPageSize={true}
                        onGridReady={onGridReady}
                        rowSelection="multiple"
                        rowMultiSelectWithClick={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default YJKCustomerScreen;