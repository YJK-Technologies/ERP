import React, { useState, useEffect } from "react";
import "./input.css";
import Select from 'react-select';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import CustomerHdrInputPopup from "./Customerhdrinput";
import { useLocation } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from './Loading';
import ClientInfo from "./ClientInfo";

const config = require('./Apiconfig');


function ADDClientInfo({ }) {
  const [open2, setOpen2] = React.useState(false);
  const navigate = useNavigate();
  const [Client_code, setClient_code] = useState("");
  const [Company_or_Personal, setCompany_or_Personal] = useState("");
  const [CompanyName, setCompanyName] = useState("");
  const [Phone, setPhone] = useState("");
  const [GSTIn, setGSTIn] = useState("");
  const [City, setCity] = useState("");
  const [Tag, setTag] = useState("");
  const [Stage, setStage] = useState("");
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [Zip, setZip] = useState("");
  const [State, setState] = useState("");
  const [Country, setCountry] = useState("");
  const [Notes, setNotes] = useState("");
  const [Website, setWebsite] = useState("");
  const [ExpectedRevenue, setExpectedRevenue] = useState("0");
  const [Last_Payment, setLast_Payment] = useState("");
  const [Live_Date, setLive_Date] = useState("");
  const [Payment, setPayment] = useState("");
  const [Product, setProduct] = useState("");
  const [Product_URL, setProduct_URL] = useState("");
  const [Client_Company_code, setClient_Company_code] = useState("");
  const [Client_Database, setClient_Database] = useState("");
  const [Email, setEmail] = useState("");
  const [Payment_Mode, setPayment_Mode] = useState("");
  const [SelectedPayment_Mode, setselectedPayment] = useState("");
  const [SelectedPayment_type, setselectedPaymentType] = useState("");
  const [Payment_Type, setPayment_Type] = useState("");
  const [customercodedrop, setcustomercodedrop] = useState([]);
  const [SMcodedrop, setsmcodedrop] = useState([]);
  const [TRcodedrop, settrcodedrop] = useState([]);
  const [BRcodedrop, setbrcodedrop] = useState([]);
  const [drop, setDrop] = useState([]);
  const [condrop, setCondrop] = useState([]);
  const [statedrop, setStatedrop] = useState([]);
 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [officedrop, setOfficedrop] = useState([]);
  const [paymentdrop, setpaymentmodedrop] = useState([]);
  const [paymenttypedrop, setpaymentTypedrop] = useState([]);


  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
    const [financialYearStart, setFinancialYearStart] = useState('');
    const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [transaction_date, settransaction_date] = useState("");

  const modified_by = sessionStorage.getItem("selectedUserCode");
  const [isUpdated, setIsUpdated] = useState(false);

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  console.log(selectedRow);

  const clearInputFields = () => {
    setClient_code("");
    setCompany_or_Personal("");
    setCompanyName("");
    setPhone("");
    setGSTIn('');
    setWebsite('');
    setTag('');
    setStage('');
    setAddress1('');
    setAddress2('');
    setAddress3('');
    setCity('');
    setZip('');
    setState('');
    setCountry('');
    setNotes('');
    setExpectedRevenue(0);
    setPayment(0);
    setProduct('');
    setProduct_URL('');
    setEmail('');
    setPayment_Mode('');
    setPayment_Type('');
    setselectedPayment('');
    setselectedPaymentType('');
    setLive_Date('');
    setLast_Payment('');
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setAddress1(selectedRow.customer_addr_1 || "")
      setAddress2(selectedRow.customer_addr_2 || "");
      setAddress3(selectedRow.customer_addr_3 || "");
      setClient_code(selectedRow.Client_code || "");
      setCompany_or_Personal(selectedRow.Company_or_Personal || "");
      setCompanyName(selectedRow.CompanyName || "");
      setPhone(selectedRow.Phone || "");
      setGSTIn(selectedRow.GSTIn || "");
      setWebsite(selectedRow.Website || "");
      setTag(selectedRow.Tag || "");
      setStage(selectedRow.Stage || "");
      setAddress1(selectedRow.Address1 || "");
      setAddress2(selectedRow.Address2 || "");
      setAddress3(selectedRow.Address3 || "");
      setCity(selectedRow.City || "");
      setZip(selectedRow.Zip || "");
      setState(selectedRow.State || "");
      setCountry(selectedRow.Country || "");
      setExpectedRevenue(selectedRow.ExpectedRevenue || "");
      setPayment(selectedRow.Payment || "");
      setProduct(selectedRow.Product || "");
      setProduct_URL(selectedRow.Product_URL || "");
      setEmail(selectedRow.Email || "");
      setPayment_Mode(selectedRow.Payment_Mode || "");
      setPayment_Type(selectedRow.Payment_Type || "");
      setLast_Payment(selectedRow.Last_Payment || "");
      setLive_Date(selectedRow.Last_Payment || "");
      setNotes(selectedRow.Notes || "");
      setselectedPayment({
        label: selectedRow.Payment_Mode,
        value: selectedRow.Payment_Mode,
      });
      setselectedPaymentType({
        label: selectedRow.Payment_Type,
        value: selectedRow.Payment_Type,
      });

    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]); 
  

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/customercode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const val = await response.json();
        setcustomercodedrop(val);
      } catch (error) {
        console.error('Error fetching Vendors:', error);
      }
    };

    if (company_code) {
      fetchCustomer();
    }
  }, []);


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/trcode`)
      .then((data) => data.json())
      .then((val) => settrcodedrop(val));
  }, []);
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/smcode`)
      .then((data) => data.json())
      .then((val) => setsmcodedrop(val));
  }, []);
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/brcode`)
      .then((data) => data.json())
      .then((val) => setbrcodedrop(val));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/city`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setDrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/country`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setCondrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);



  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getofftype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setOfficedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/GetPaymentMode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setpaymentmodedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/GetPaymentType`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setpaymentTypedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);




  const filteredOptionCode = Array.isArray(customercodedrop)
    ? customercodedrop.map((option) => ({
      value: option.customer_code,
      label: `${option.customer_code} - ${option.customer_name}`,
    }))
    : [];

  const filteredOptionTransaction = TRcodedrop.map((option) => ({
    value: option.keyfield,
    label: option.keyfield,
  }));

  const filteredOptionSales = SMcodedrop.map((option) => ({
    value: option.keyfield,
    label: option.keyfield,
  }));

  const handleChangePaymentMode = (selectedCustomer) => {
    setselectedPayment(selectedCustomer);
    setPayment_Mode(selectedCustomer ? selectedCustomer.value : '');
  };
  const handleChangePaymentType = (selectedCustomer) => {
    setselectedPaymentType(selectedCustomer);
    setPayment_Type(selectedCustomer ? selectedCustomer.value : '');
  };

    const filteredOptionPaymentMode = paymentdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));
    const filteredOptionPaymentType = paymenttypedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));



  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    settransaction_date(currentDate);
  }, [currentDate]);

  
 const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
      if (selectedDate !== currentDate) {
        console.log("Date has been changed.");
      }
      settransaction_date(selectedDate);
    } else {
      toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
    }
  };
 

  const handleNavigate = () => {
    navigate("/ClientInfo", {}); // Pass selectedRows as props to the Input component
  };

  const handleInsert = async () => {
    if (
      !Client_code ||
      !Company_or_Personal ||
      !CompanyName||
      !Address1||
      !Address2||
      !Email||
      !Payment_Mode||
      !Payment_Type 
    ) {
      setError(" ");
      return;
    }

    // Email validation
    if (!validateEmail(Email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/PMS_Client_infoInsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Company_code: sessionStorage.getItem('selectedCompanyCode'),
          Client_code,
          CompanyName,
          Company_or_Personal,
          Phone,
          GSTIn,
          Product_URL,
          City,
          Tag,
          Stage,
          Address1,
          Address2,
          Address3,
          Zip,
          State,
          Notes,
          Client_Database,
          Client_Company_code,
          Country,
          Website,
          ExpectedRevenue,
          Payment,
          Product,
          Live_Date,
          Last_Payment,
          Email,
          Payment_Mode,
          Payment_Type,
          created_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(), // Reloads the page after the toast closes
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message, {

        });
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message, {

      });
    }
    finally {
      setLoading(false);
    }
  };


  const handleUpdate = async () => {
    if (
      !Client_code ||
      !Company_or_Personal ||
      !CompanyName||
      !Address1||
      !Address2||
      !Email||
      !Payment_Mode||
      !Payment_Type 
    ) {
      setError(" ");
      return;
    }

    // Email validation
    if (!validateEmail(Email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/PMS_Client_infoUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Company_code: sessionStorage.getItem('selectedCompanyCode'),
          Client_code,
          Company_or_Personal,
          CompanyName,
          Phone,
          GSTIn,
          City,
          Tag,
          Stage,
          Address1,
          Address2,
          Address3,
          Zip,
          State,
          Notes,
          Country,
          Website,
          Client_Company_code,
          Client_Database,
          ExpectedRevenue,
          Payment,
          Product,
          Email,
          Last_Payment,
          Live_Date,
          Payment_Mode,
          Payment_Type,
          Product_URL,
          modified_by: sessionStorage.getItem('selectedUserCode')
        }),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setIsUpdated(true);
        clearInputFields();
        toast.success("Data Updated successfully!")
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message, {

        });
      } else {
        console.error("Failed to insert data");
        toast.error('Failed to insert data', {

        });
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message, {

      });
    }
    finally {
      setLoading(false);
    }
  };


  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {
      // Check if the value has changed and handle the search logic
      if (hasValueChanged) {
        await handleKeyDownStatus(e); // Trigger the search function
        setHasValueChanged(false); // Reset the flag after the search
      }

      // Move to the next field if the current field has a valid value
      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault(); // Prevent moving to the next field if the value is empty
      }
    }
  };



  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) { // Only trigger search if the value has changed
      // Trigger the search function
      setHasValueChanged(false); // Reset the flag after search
    }
  };

  const handleClickOpen = (params) => {
    setOpen2(true);
    console.log("Opening popup...");
  };
  const handleClose = () => {
    setOpen2(false);
  };


  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class=""  >
          {loading && <LoadingScreen />}

          <ToastContainer
            position="top-right"
            className="toast-design" // Adjust this value as needed
            theme="colored"
          />
          <div className="shadow-lg p-0 bg-body-tertiary rounded  ">
            <div className=" mb-0 d-flex justify-content-between" >
              <h1 align="left" class="purbut" > {mode === "update" ? 'Update Customer Details' : 'Add Client Info '} </h1>
              <h1 align="left" class="mobileview fs-4" > {mode === "update" ? 'Update Customer Details' : 'Add Customer Details '} </h1>
              <button onClick={handleNavigate} className=" btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="pt-2 mb-4">
            <div className="shadow-lg p-3 bg-body-tertiary rounded  mb-2">
              <div class="row">
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="state" class={`exp-form-labels ${error && !Client_code ? 'text-danger' : ''}`}>
                       Client Code
                        </label></div>
                      <div> <span className="text-danger">*</span></div>
                    </div>
                      <input
                        id="cusco"
                        value={Client_code}
                         onChange={(e) => setClient_code(e.target.value)}
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={18}
                      />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class={`exp-form-labels ${error && !Company_or_Personal ? 'text-danger' : ''}`}>
                   Company or Personal 
                      </label></div>
                      <div> <span className="text-danger">*</span></div>
                    </div><input
                      id="cusad1"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ Company_or_Personal }
                      onChange={(e) => setCompany_or_Personal(e.target.value)}
                      maxLength={250}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class={`exp-form-labels ${error && !CompanyName ? 'text-danger' : ''}`}>
                     Company Name
                      </label></div>
                      <div> <span className="text-danger">*</span></div>
                    </div><input
                      id="cusad2"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={CompanyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      maxLength={250}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusad3" class="exp-form-labels">
                 Phone
                    </label>  <input
                      id="cusad3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={Phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusad4" class="exp-form-labels">
                    GST IN
                    </label><input
                      id="cusad4"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={GSTIn}
                      onChange={(e) => setGSTIn(e.target.value)}
                      maxLength={20}
                    
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class="exp-form-labels">
                    Website
                      </label></div>
                    </div>
                    <div title="Select the City">
                      <input
                        id="city"
                        value={Website}
                         onChange={(e) => setWebsite(e.target.value)}
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={150}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="rid" class="exp-form-labels">
                      Tag<div> </div>
                    </label>
                    <div title="Select the State">
                      <input
                        id="state"
                        value={Tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={100}
                      />
                      
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="rid" class="exp-form-labels">
                      Stage<div> </div>
                    </label>
                    <div title="Select the State">
                      <input
                        id="state"
                        value={Stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={50}
                      />
                      
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class={`exp-form-labels ${error && !Address1 ? 'text-danger' : ''}`}>
                       Address1
                      </label></div>
                      <div> <span className="text-danger">*</span></div>
                    </div>
                    <div title="Select the Country">
                      <input
                        id="country"
                        value={Address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={100}
                       
                      />
                     
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class={`exp-form-labels ${error && !Address2 ? 'text-danger' : ''}`}>
                       Address2
                      </label></div>
                      <div> <span className="text-danger">*</span></div>
                    </div> <input
                      id="cusimex"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the IMEX number"
                      value={Address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      maxLength={100}
              
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusoff" class="exp-form-labels">
                  Address3
                    </label><input
                      id="cusoff"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the office number"
                      value={Address3}
                      onChange={(e) => setAddress3(e.target.value)}
                      maxLength={100}
                    
                    />
                     
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusresi" class="exp-form-labels">
                    City
                    </label> <input
                      id="cusresi"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the residential number"
                      value={City}
                      onChange={(e) => setCity(e.target.value)}
                      maxLength={20}
                   
                    />
                    
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class="exp-form-labels">
                     Zip Code
                      </label></div>
                    
                    </div><input
                      id="mobno"
                      class="exp-input-field form-control"
                      type="number"
                      placeholder=""
                      required title="Please enter the mobile number"
                      value={Zip}
                      onChange={(e) => setZip(e.target.value)}
                      maxLength={20}
                
                    />
                    
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class="exp-form-labels">
                    State
                      </label></div>
                    </div> <input
                      id="cusfax"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the FAX number"
                      value={State}
                      onChange={(e) => setState(e.target.value)}
                      maxLength={20}
                     
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class="exp-form-labels">
                      Country
                      </label></div>
                      <div> </div>
                    </div><input
                      id="emailid"
                      class="exp-input-field form-control"
                      type="email"
                      placeholder=""
                      required title="Please enter the email ID"
                      value={Country}
                      onChange={(e) => setCountry(e.target.value)}
                      maxLength={250}
                    
                    />
                   
                  </div>
                </div>
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="custrans" class="exp-form-labels">
                     Expected Revenue
                    </label>
                    <div title="Select the Transport Code">
                      <input
                        id="custrans"
                        value={ExpectedRevenue}
                        onChange={(e) => setExpectedRevenue(e.target.value)}
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={13}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cussales" class="exp-form-labels">
                    Payment
                    </label>
                    <div title="Select the Salesman Code">
                      <input
                        id="Payment"
                        value={Payment}
                        onChange={(e) => setPayment(e.target.value)}                        
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={13}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusbro" class="exp-form-labels">
                    Product
                    </label>
                    <div title="Select the Broker Code">
                      <input
                        id="cusbro"
                        value={Product}
                        onChange={(e) => setProduct(e.target.value)}                         
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusbro" class="exp-form-labels">
                    Product URL
                    </label>
                    <div title="Select the Broker Code">
                      <input
                        id="cusbro"
                        value={Product_URL}
                        onChange={(e) => setProduct_URL(e.target.value)}                         
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusbro" class="exp-form-labels">
                Client Company Code
                    </label>
                    <div title="Select the Broker Code">
                      <input
                        id="cusbro"
                        value={Client_Company_code}
                        onChange={(e) => setClient_Company_code(e.target.value)}                         
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="cusbro" class="exp-form-labels">
                Client Database
                    </label>
                    <div title="Select the Broker Code">
                      <input
                        id="cusbro"
                        value={Client_Database}
                        onChange={(e) => setClient_Database(e.target.value)}                         
                        className="exp-input-field form-control"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                     <div class="d-flex justify-content-start">
                    <div><label for="cusweek" class={`exp-form-labels ${error && !Email ? 'text-danger' : ''}`}>
                     Email
                    </label></div>
                    <div> <span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="cusweek"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please select a weekday code"
                      value={Email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                    <label for="cusweek" class={`exp-form-labels ${error && !Payment_Mode ? 'text-danger' : ''}`}>
                  Payment Mode
                    </label>
                    <div> <span className="text-danger">*</span></div>
                    </div>
                    <div title="Select the Office Type">
                      <Select
                        id="officeType"
                        value={SelectedPayment_Mode}
                      onChange={handleChangePaymentMode}
                       options={filteredOptionPaymentMode}
                        className="exp-input-field"
                        placeholder=""
                        maxLength={25}
                     
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                    <label for="cusweek" class={`exp-form-labels ${error && !Payment_Type ? 'text-danger' : ''}`}>
                     Payment Type
                    </label>
                    <div> <span className="text-danger">*</span></div>
                    </div>
                    <div title="Select the  Default Customer">
                      <Select
                        id="officeType"
                        value={SelectedPayment_type}
                       onChange={handleChangePaymentType}
                       options={filteredOptionPaymentType}
                        className="exp-input-field"
                        placeholder=""
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>
                    <div className="col-md-3 form-group mb-2">
                      <div class="exp-form-floating">
                        <div class="d-flex justify-content-start">
                          <div> <label for="add2" class="exp-form-labels">
                            Last Payment
                          </label> </div>
                          <div><span className="text-danger"></span></div>
                        </div>
                        <input
                          id="StartDate"
                          class="exp-input-field form-control"
                          type="date"
                          placeholder=""
                          required title="Please Choose the Year"
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

                    <div className="col-md-14 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="rid" class="exp-form-labels">
                       Notes
                      </label></div> 
                    </div><textarea
                      id="cuscre"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the credit limit"
                      value={Notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ height: '100px' }}
                    />
                  </div>
                </div>
              
              
                <div class="col-md-3 form-group d-flex justify-content-start p-2">
                  {mode === "create" ? (
                    <button onClick={handleInsert} className="mt-3" title="Save">
                      <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                  ) : (
                    <button onClick={handleUpdate} className="mt-3" title="Update">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                  )}
                </div>
                <div>
                  <CustomerHdrInputPopup open={open2} handleClose={handleClose} />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
export default ADDClientInfo;