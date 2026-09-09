import React, { useState, useEffect } from "react";
import { showConfirmationToast } from "../../ToastConfirmation";
import LoadingScreen from "../../Loading";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const YJKCustomerScreen = () => {
    // Grid Data State
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter Input States
    const [customerName, setCustomerName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [regarding, setRegarding] = useState("");
    const [url, setUrl] = useState("");

    //code added by Harish purpose of set user permisssion
    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
    const YjkCustomerPermission = permissions
        .filter(permission => permission.screen_type === 'YjkCustomer')
        .map(permission => permission.permission_type.toLowerCase());

    const columnDefs = [
        { headerName: "Customer ID", field: "Customer_ID" },
        { headerName: "Customer Name", field: "Customer_Name" },
        { headerName: "Company Name", field: "Company_Name" },
        { headerName: "Phone", field: "Phone" },
        { headerName: "Email", field: "Email" },
        { headerName: "Regarding", field: "Regarding" },
        { headerName: "URL", field: "URL" },
        { headerName: "Demo Status", field: "Demo_Status" },
        { headerName: "Feedback", field: "Feedback" },
        { headerName: "Website URL", field: "Website_URL" },
        { headerName: "Website Date", field: "Website_Date" },
        { headerName: "No of Users", field: "No_of_Users" },
        { headerName: "Reference", field: "Reference" },
        { headerName: "Live Date", field: "Live_Date" },
        { headerName: "Amount", field: "Amount" },
        { headerName: "New Requirement 1", field: "New_Requirement_1" },
        { headerName: "New Requirement 2", field: "New_Requirement_2" },
        { headerName: "Development Status", field: "Development_Status" },
        { headerName: "Status", field: "Status" },
        { headerName: "Website Renewal", field: "Website_Renewal" },
        { headerName: "Renewal Reminder", field: "Renewal_Remaider" },
        { headerName: "Renewal Expired", field: "Renewal_Expired" },
    ];

    const defaultColDef = {
        resizable: true,
        wrapText: true,
    };

    const handleSearch = () => {
        console.log("Searching for:", {
            customerName,
            companyName,
            phone,
            email,
            regarding,
            url,
        });
    };

    const clearInputFields = () => {
        setCustomerName("");
        setCompanyName("");
        setPhone("");
        setEmail("");
        setRegarding("");
        setUrl("");
        setRowData([]);
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}

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
                        <addbutton className="" title="Add New Customer">
                            <i className="fa-solid fa-user-plus"></i>
                        </addbutton>
                        )}
                        {['delete', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                        <delbutton className="purbut" title="Delete Selected Customer">
                            <i className="fa-solid fa-user-minus"></i>
                        </delbutton>
                        )}
                        {['update', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                        <savebutton className="purbut" title="Update Customer Records">
                            <i className="fa-solid fa-floppy-disk"></i>
                        </savebutton>
                        )}
                        {['all permission', 'view'].some(permission => YjkCustomerPermission.includes(permission)) && (
                        <printbutton className="purbut" title="Generate Customer Report">
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
                                            <icon class="icon">
                                                <i class="fa-solid fa-user-plus"></i>
                                            </icon>
                                        )}
                                    </li>
                                    <li class="iconbutton  d-flex justify-content-center text-danger">
                                        {['delete', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon">
                                                <i class="fa-solid fa-user-minus"></i>
                                            </icon>
                                        )}
                                    </li>
                                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                                        {['update', 'all permission'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon">
                                                <i class="fa-solid fa-floppy-disk"></i>
                                            </icon>
                                        )}
                                    </li>
                                    <li class="iconbutton  d-flex justify-content-center ">
                                        {['all permission', 'view'].some(permission => YjkCustomerPermission.includes(permission)) && (
                                            <icon class="icon">
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
                        rowSelection="multiple"
                    />
                </div>
            </div>
        </div>
    );
};

export default YJKCustomerScreen;