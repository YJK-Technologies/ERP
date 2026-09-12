import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../Loading';
import { useLocation, useNavigate } from "react-router-dom";

const config = require('../../Apiconfig');

const AddYJKCustomerScreen = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const locationState = location.state || {};
    const mode = locationState.mode || "create";
    const customer_id = locationState.customer_id;
    const customerData = locationState.customerData || {};
    // Form Field States
    const [customerName, setCustomerName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [regarding, setRegarding] = useState("");
    const [url, setUrl] = useState("");
    const [selectedDemoStatus, setSelectedDemoStatus] = useState("");
    const [demoStatus, setDemoStatus] = useState("");
    const [feedback, setFeedback] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [websiteDate, setWebsiteDate] = useState("");
    const [noOfUsers, setNoOfUsers] = useState("");
    const [reference, setReference] = useState("");
    const [liveDate, setLiveDate] = useState("");
    const [amount, setAmount] = useState("");
    const [newRequirement1, setNewRequirement1] = useState("");
    const [newRequirement2, setNewRequirement2] = useState("");
    const [selectedDevelopmentStatus, setSelectedDevelopmentStatus] = useState("");
    const [developmentStatus, setDevelopmentStatus] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [status, setStatus] = useState("");
    const [websiteRenewal, setWebsiteRenewal] = useState("");
    const [renewalRemainder, setRenewalRemainder] = useState("");
    const [renewalExpired, setRenewalExpired] = useState("");
    const [statusDrop, setStatusDrop] = useState([]);
    

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

    useEffect(() => {
    if (mode === "update" && customerData.customer_id) {

        setCustomerName(customerData.customer_name || "");
        setCompanyName(customerData.company_name || "");
        setPhone(customerData.phone || "");
        setEmail(customerData.email || "");
        setRegarding(customerData.regarding || "");
        setUrl(customerData.url || "");

        setDemoStatus(customerData.demo_status || "");
        setSelectedDemoStatus(
            customerData.demo_status
                ? {
                    value: customerData.demo_status,
                    label: customerData.demo_status
                }
                : null
        );

        setFeedback(customerData.feedback || "");
        setWebsiteUrl(customerData.website_url || "");
        setWebsiteDate(customerData.website_date || "");
        setNoOfUsers(customerData.no_of_users || "");
        setReference(customerData.reference || "");
        setLiveDate(customerData.live_date || "");
        setAmount(customerData.amount || "");

        setNewRequirement1(customerData.new_requirement_1 || "");
        setNewRequirement2(customerData.new_requirement_2 || "");

        setDevelopmentStatus(customerData.development_status || "");
        setSelectedDevelopmentStatus(
            customerData.development_status
                ? {
                    value: customerData.development_status,
                    label: customerData.development_status
                }
                : null
        );

        setStatus(customerData.status || "");
        setSelectedStatus(
            customerData.status
                ? {
                    value: customerData.status,
                    label: customerData.status
                }
                : null
        );

        setWebsiteRenewal(customerData.WebsiteRenewal || "");
        setRenewalRemainder(customerData.RenewalRemaider || "");
        setRenewalExpired(customerData.RenewalExpired || "");
    }
}, [mode, customerData]);

    const handleChangeDemoStatus = (selectedDemoStatus) => {
        setSelectedDemoStatus(selectedDemoStatus);
        setDemoStatus(selectedDemoStatus ? selectedDemoStatus.value : '');
    };

    const handleChangeDevelopmentStatus = (selectedDevelopmentStatus) => {
        setSelectedDevelopmentStatus(selectedDevelopmentStatus);
        setDevelopmentStatus(selectedDevelopmentStatus ? selectedDevelopmentStatus.value : '');
    };

    const handleChangeStatus = (selectedStatus) => {
        setSelectedStatus(selectedStatus);
        setStatus(selectedStatus ? selectedStatus.value : '');
    };

    const handleAdd = async () => {
    try {
        setLoading(true);

        const company_code =
            sessionStorage.getItem("selectedCompanyCode");

        const created_by =
            sessionStorage.getItem("selectedUserCode");

        const payload = {
            customer_name: customerName,
            company_name: companyName,
            phone: phone,
            email: email,
            regarding: regarding,
            url: url,
            demo_status: demoStatus,
            feedback: feedback,
            website_url: websiteUrl,
            website_date: websiteDate || "",
            no_of_users: Number(noOfUsers) || 0,
            reference: reference,
            live_date: liveDate || "",
            amount: Number(amount) || 0,
            new_requirement_1: newRequirement1,
            new_requirement_2: newRequirement2,
            development_status: developmentStatus,
            status: status,

            WebsiteRenewal: websiteRenewal || "",
            RenewalRemaider: renewalRemainder,
            RenewalExpired: renewalExpired || "",

            company_code: company_code,

            created_by: created_by,
            
        };

        const response = await fetch(
            `${config.apiBaseUrl}/YJKcustomer_DetailsInsert`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to add customer"
            );
        }

        toast.success("Customer added successfully");

        
    } catch (error) {
        console.error("Add Customer Error:", error);
        toast.error(error.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
};
const handleUpdate = async () => {
    try {
        setLoading(true);

        const company_code =
            sessionStorage.getItem("selectedCompanyCode");

        const modified_by =
            sessionStorage.getItem("selectedUserCode");

        const payload = {
            customer_id: customerData.customer_id,
            customer_name: customerName,
            company_name: companyName,
            phone: phone,
            email: email,
            regarding: regarding,
            url: url,
            demo_status: demoStatus,
            feedback: feedback,
            website_url: websiteUrl,
            website_date: websiteDate || "",
            no_of_users: Number(noOfUsers) || 0,
            reference: reference,
            live_date: liveDate || "",
            amount: Number(amount) || 0,
            new_requirement_1: newRequirement1,
            new_requirement_2: newRequirement2,
            development_status: developmentStatus,
            status: status,
            WebsiteRenewal: websiteRenewal || "",
            RenewalRemaider: renewalRemainder,
            RenewalExpired: renewalExpired || "",
            company_code: company_code,
            modified_by: modified_by,
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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to update customer"
            );
        }

        toast.success("Customer updated successfully");

        setTimeout(() => {
            handleNavigate();
        }, 1000);

    } catch (error) {
        console.error("Update Customer Error:", error);
        toast.error(error.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
};

const fetchCustomerData = async () => {
    try {
        setLoading(true);

        const response = await fetch(
            `${config.apiBaseUrl}/getYJKcustomer_Details`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customerName: "",
                    companyName: "",
                    phone: "",
                    email: "",
                    regarding: "",
                    url: "",
                    From_RenewalExpired: "",
                    To_RenewalExpired: "",
                    status: "",
                    company_code: sessionStorage.getItem("selectedCompanyCode")
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch customer data");
        }

        const data = await response.json();

        const selectedCustomer = data.find(
            (item) => String(item.customer_id) === String(customer_id)
        );

        if (!selectedCustomer) {
            toast.error("Customer data not found");
            return;
        }

        console.log("Selected Customer:", selectedCustomer);

        setCustomerName(selectedCustomer.customer_name || "");
        setCompanyName(selectedCustomer.company_name || "");
        setPhone(selectedCustomer.phone || "");
        setEmail(selectedCustomer.email || "");
        setRegarding(selectedCustomer.regarding || "");
        setUrl(selectedCustomer.url || "");

        setDemoStatus(selectedCustomer.demo_status || "");
        setSelectedDemoStatus(
            selectedCustomer.demo_status
                ? {
                    value: selectedCustomer.demo_status,
                    label: selectedCustomer.demo_status
                }
                : null
        );

        setFeedback(selectedCustomer.feedback || "");
        setWebsiteUrl(selectedCustomer.website_url || "");
        setWebsiteDate(
            selectedCustomer.website_date
                ? selectedCustomer.website_date.split("T")[0]
                : ""
        );

        setNoOfUsers(selectedCustomer.no_of_users || "");
        setReference(selectedCustomer.reference || "");

        setLiveDate(
            selectedCustomer.live_date
                ? selectedCustomer.live_date.split("T")[0]
                : ""
        );

        setAmount(selectedCustomer.amount || "");

        setNewRequirement1(selectedCustomer.new_requirement_1 || "");
        setNewRequirement2(selectedCustomer.new_requirement_2 || "");

        setDevelopmentStatus(selectedCustomer.development_status || "");
        setSelectedDevelopmentStatus(
            selectedCustomer.development_status
                ? {
                    value: selectedCustomer.development_status,
                    label: selectedCustomer.development_status
                }
                : null
        );

        setStatus(selectedCustomer.status || "");
        setSelectedStatus(
            selectedCustomer.status
                ? {
                    value: selectedCustomer.status,
                    label: selectedCustomer.status
                }
                : null
        );

        setWebsiteRenewal(selectedCustomer.WebsiteRenewal || "");
        setRenewalRemainder(selectedCustomer.RenewalRemaider || "");
        setRenewalExpired(
            selectedCustomer.RenewalExpired
                ? selectedCustomer.RenewalExpired.split("T")[0]
                : ""
        );

    } catch (error) {
        console.error("Fetch Customer Data Error:", error);
        toast.error("Failed to load customer data");
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    if (mode === "update" && customer_id) {
        fetchCustomerData();
    }
}, [mode, customer_id]);


    const handleNavigate = () => {
        navigate("/YjkCustomer", {
            state: {
                preservedRowData: location.state?.preservedRowData,
                preservedInputs: location.state?.preservedInputs
            }
        });
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* HEADER */}
            <div className="shadow-lg p-0 bg-body-tertiary rounded">
                <div className="mb-0 d-flex justify-content-between">
                    <h1 align="left" className="purbut"> {mode === "update" ? 'Update YJK Customer' : 'Add YJK Customer'} </h1>
                    <h1 align="left" className="mobileview fs-4"> {mode === "update" ? 'Update Customer Details' : 'Add Customer Details'} </h1>
                    <button
                        onClick={handleNavigate}
                        className="btn btn-danger shadow-none rounded-0 h-70 fs-5"
                        required
                        title="Close Form"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            {/* FORM */}
            <div className="pt-2 mb-4">
                <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
                    <div className="row g-3 mb-2">

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Customer Name</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Customer Name"
                                    title="Enter full name of the customer"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Company Name</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Company Name"
                                    title="Enter company or organization name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Phone</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Phone"
                                    title="Enter contact phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Email</label>
                                <input
                                    type="email"
                                    className="exp-input-field form-control"
                                    placeholder="Enter Email"
                                    title="Enter valid email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Regarding</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Regarding"
                                    title="Enter subject or purpose of inquiry"
                                    value={regarding}
                                    onChange={(e) => setRegarding(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">URL</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter URL"
                                    title="Enter primary project or reference URL"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Demo Status</label>
                                <Select
                                    className="exp-input-field"
                                    options={filteredOptionStatus}
                                    placeholder="Select Demo Status"
                                    title="Select current product demo status"
                                    value={selectedDemoStatus}
                                    onChange={handleChangeDemoStatus}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Feedback</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Feedback"
                                    title="Enter customer feedback or comments"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Website URL</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Website URL"
                                    title="Enter customer official website web address"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Website Date</label>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    title="Select website launch or creation date"
                                    value={websiteDate}
                                    onChange={(e) => setWebsiteDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">No of Users</label>
                                <input
                                    type="number"
                                    className="exp-input-field form-control"
                                    placeholder="Enter Number of Users"
                                    title="Enter total number of active users"
                                    value={noOfUsers}
                                    onChange={(e) => setNoOfUsers(e.target.value)}
                                    onKeyDown={(e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Reference</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Reference"
                                    title="Enter referral source or contact reference"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Live Date</label>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    title="Select production go-live date"
                                    value={liveDate}
                                    onChange={(e) => setLiveDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Amount</label>
                                <input
                                    type="number"
                                    className="exp-input-field form-control"
                                    placeholder="Enter Amount"
                                    title="Enter deal or subscription amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    onKeyDown={(e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); }}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">New Requirement 1</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter New Requirement 1"
                                    title="Enter additional requirement details"
                                    value={newRequirement1}
                                    onChange={(e) => setNewRequirement1(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">New Requirement 2</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter New Requirement 2"
                                    title="Enter secondary additional requirement details"
                                    value={newRequirement2}
                                    onChange={(e) => setNewRequirement2(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Development Status</label>
                                <Select
                                    className="exp-input-field"
                                    options={filteredOptionStatus}
                                    placeholder="Select Development Status"
                                    title="Select current development phase"
                                    value={selectedDevelopmentStatus}
                                    onChange={handleChangeDevelopmentStatus}
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

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Website Renewal</label>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    title="Select website domain/hosting renewal date"
                                    value={websiteRenewal}
                                    onChange={(e) => setWebsiteRenewal(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Renewal Reminder</label>
                                <input
                                    className="exp-input-field form-control"
                                    placeholder="Enter Renewal Reminder"
                                    title="Enter notes or days notice needed for renewal"
                                    value={renewalRemainder}
                                    onChange={(e) => setRenewalRemainder(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Renewal Expired</label>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    title="Select renewal expiration date"
                                    value={renewalExpired}
                                    onChange={(e) => setRenewalExpired(e.target.value)}
                                />
                            </div>
                        </div>

                    </div>

                    {/* ACTION BUTTONS */}
{mode === "create" ? (
    <button
        type="button"
        className=""
        title="Save New Customer Details"
        onClick={handleAdd}
    >
        <i className="fa-solid fa-floppy-disk"></i>
    </button>
) : (
    <button
        type="button"
        className=""
        title="Update Customer Details"
        onClick={handleUpdate}
    >
        <i className="fa-solid fa-pen-to-square"></i>
    </button>
)}

                </div>
            </div>

        </div>
    );
};

export default AddYJKCustomerScreen;