import React, { useState, useRef, useEffect } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import LoadingScreen from "../Loading";
import Select from "react-select";
import Webcam from "react-webcam";
const config = require("../Apiconfig");

function AddVisitorMaster({ }) {
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
  const [selectedCustomerType, setSelectedCustomerType] = useState([]);
  const [customerTypeDrop, setCustomerTypeDrop] = useState([]);
  const [error, setError] = useState("");
  const Location = useRef(null);
  const navigate = useNavigate();
  const [keyfield, setKeyfield] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const [visitorNo, setVisitorNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  console.log(selectedRow);

  const clearInputFields = () => {
    setVisitorName("");
    setStatus("");
    setSelectedStatus("");
    setIdProofType("");
    setSelectedIdProofType("");
    setIdProofNo("");
    setCompanyName("");
    setCustomerType("");
    setSelectedCustomerType("");
    setKeyfield("");
    setVisitorNo("");
    setExpiryDate("");
  };

  const mapCommaStringToSelectOptions = (valueString, optionsList) => {
    if (!valueString) return [];

    const values = valueString.split(",").map(v => v.trim());

    // Always return ARRAY
    const selectedOptions = optionsList.filter(opt =>
      values.includes(opt.value)
    );

    return selectedOptions;
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    const d = new Date(dateValue);
    if (isNaN(d)) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // yyyy-MM-dd
  };

  useEffect(() => {
    if (mode === "update" && selectedRow) {
      setVisitorId(selectedRow.Visitor_ID || "");
      setVisitorName(selectedRow.Visitor_Name || "");
      setStatus(selectedRow.Status || "");
      setIdProofType(selectedRow.ID_Proof || "");
      setIdProofNo(selectedRow.ID_Proof_No || "");
      setCompanyName(selectedRow.Company_Name || "");
      setCustomerType(selectedRow.Customer_type || "");
      setVisitorNo(selectedRow.Phone_No || "");
      setExpiryDate(formatDateForInput(selectedRow.Expired_Date));
      setSelectedStatus({
        label: selectedRow.Status,
        value: selectedRow.Status,
      });
      setSelectedIdProofType({
        label: selectedRow.ID_Proof,
        value: selectedRow.ID_Proof,
      });
      const mappedCustomerTypes = mapCommaStringToSelectOptions(
        selectedRow.Customer_type,
        filteredOptionCustomerType
      );

      // ?? ALWAYS ARRAY (even for single)
      setSelectedCustomerType(mappedCustomerTypes);
      setKeyfield(selectedRow.Keyfield || "");
    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, customerTypeDrop]);

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

  // const handleInsert = async () => {
  //   if (!visitorName || !status || !idProofType || !idProofNo || !companyName
  //     || !customerType || !expiryDate) {
  //     setError(" ");
  //     toast.warning("Error: Missing required fields");
  //     return;
  //   }
  //   setLoading(true);
  //   let images = [];

  //   // for (let i = 0; i < 5; i++) {
  //   //   let image = webcamRef.current.getScreenshot();
  //   //   images.push(image);
  //   //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   // }

  //   if (webcamRef.current) {
  //     for (let i = 0; i < 5; i++) {
  //       const image = webcamRef.current.getScreenshot();
  //       if (image) images.push(image);
  //       await new Promise(resolve => setTimeout(resolve, 1000));
  //     }
  //   }

  //   try {
  //     const response = await fetch(`${config.apiBaseUrl}/VisitorMasterInsert`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         company_code: sessionStorage.getItem('selectedCompanyCode'),
  //         Visitor_Name: visitorName,
  //         ID_Proof: idProofType,
  //         ID_Proof_No: idProofNo,
  //         Company_Name: companyName,
  //         Customer_type: customerType,
  //         Status: status,
  //         Created_by: sessionStorage.getItem("selectedUserCode"),
  //         descriptor: images,
  //         Phone_No: visitorNo,
  //         Expired_Date: expiryDate
  //       }),
  //     });
  //     if (response.ok) {
  //       toast.success("Data inserted Successfully", {
  //         onClose: () => {
  //           clearInputFields();
  //         }
  //       });
  //     }
  //     else {
  //       const errorResponse = await response.json();
  //       console.error(errorResponse.message);
  //       toast.warning(errorResponse.message);
  //     }
  //   } catch (error) {
  //     console.error("Error inserting data:", error);
  //     toast.error("Error inserting data: " + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleInsert = async () => {
    if (
      !visitorName || !status || !idProofType || !idProofNo ||
      !companyName || !customerType || !expiryDate
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    setLoading(true);

    let images = [];
    let mainImage = null;

    // Capture 5 images for face encoding
    if (webcamRef.current) {
      for (let i = 0; i < 5; i++) {
        const image = webcamRef.current.getScreenshot();
        if (image) {
          images.push(image);
          if (i === 0) mainImage = image; // first image as DB image
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Convert base64 → Blob (for req.file)
    const base64ToBlob = (base64) => {
      const byteString = atob(base64.split(",")[1]);
      const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };

    const formData = new FormData();

    // Append image file
    if (mainImage) {
      const imageBlob = base64ToBlob(mainImage);
      formData.append("image", imageBlob, "visitor.jpg");
    }

    // Append normal fields
    formData.append("company_code", sessionStorage.getItem("selectedCompanyCode"));
    formData.append("Visitor_Name", visitorName);
    formData.append("ID_Proof", idProofType);
    formData.append("ID_Proof_No", idProofNo);
    formData.append("Company_Name", companyName);
    formData.append("Customer_type", customerType);
    formData.append("Status", status);
    formData.append("Created_by", sessionStorage.getItem("selectedUserCode"));
    formData.append("Phone_No", visitorNo);
    formData.append("Expired_Date", expiryDate);

    // Append descriptor images
    formData.append("descriptor", JSON.stringify(images));

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/VisitorMasterInsert`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Data inserted Successfully", {
          onClose: clearInputFields
        });
      } else {
        const err = await response.json();
        toast.warning(err.message);
      }
    } catch (error) {
      toast.error("Insert failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!visitorId || !visitorName || !status || !idProofType || !idProofNo ||
      !companyName || !customerType || !expiryDate) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/VisitorMasterUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          Visitor_ID: visitorId,
          Visitor_Name: visitorName,
          ID_Proof: idProofType,
          ID_Proof_No: idProofNo,
          Company_Name: companyName,
          Customer_type: customerType,
          Status: status,
          Keyfield: keyfield,
          Modified_by: sessionStorage.getItem("selectedUserCode"),
          Phone_No: visitorNo,
          Expired_Date: expiryDate
        }),
      });
      if (response.ok) {
        toast.success("Data Updated Successfully", {
          onClose: () => clearInputFields(),
        });
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigatesToForm = () => {
    navigate("/VisitorMaster");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          {loading && <LoadingScreen />}

          <ToastContainer
            position="top-right"
            className="toast-design"
            theme="colored"
          />

          <div className="shadow-lg p-0 bg-body-tertiary rounded">
            <div className=" mb-0 d-flex justify-content-between">
              <h1 align="left" class="purbut">
                {mode === "update"
                  ? "Update Visitor Master"
                  : "Add Visitor Master"}
              </h1>
              <h1 align="left" class="mobileview fs-4">
                {mode === "update"
                  ? "Update Visitor Master"
                  : "Add Visitor Master"}
              </h1>

              <button
                onClick={handleNavigatesToForm}
                className=" btn btn-danger shadow-none rounded-0 h-70 fs-5"
                required
                title="Close"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <div class="mb-4 pt-2">
            <div className="shadow-lg p-2 bg-body-tertiary rounded mb-2">
              <div className="row ms-4 mt-3 mb-3 me-4">
                {/* <div className="col-md-3 form-group">
                  <div class="exp-form-floating">
                    <label for="locno" className={`exp-form-labels ${error && !visitorId ? 'text-danger' : ''}`}>
                      Visitor Id<span className="text-danger">*</span>
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
                </div> */}
                <div className="col-md-3 form-group">
                  <div class="exp-form-floating">
                    <label for="lname" className={`exp-form-labels ${error && !visitorName ? 'text-danger' : ''}`}>
                      Visitor Name<span className="text-danger">*</span>
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
                    <label for="lname" className={`exp-form-labels ${error && !visitorNo ? 'text-danger' : ''}`}>
                      Contact Number<span className="text-danger">*</span>
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
                        setVisitorNo(value);
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group">
                  <div class="exp-form-floating">
                    <label className={`exp-form-labels ${error && !idProofType ? 'text-danger' : ''}`}>
                      Id Proof Type<span className="text-danger">*</span>
                    </label>
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
                    <label for="lname" className={`exp-form-labels ${error && !idProofNo ? 'text-danger' : ''}`}>
                      Id Proof No<span className="text-danger">*</span>
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
                    <label for="lname" className={`exp-form-labels ${error && !companyName ? 'text-danger' : ''}`}>
                      Company Name<span className="text-danger">*</span>
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
                <div className="col-md-3 form-group">
                  <div class="exp-form-floating">
                    <label className={`exp-form-labels ${error && !customerType ? 'text-danger' : ''}`}>
                      Customer Type<span className="text-danger">*</span>
                    </label>
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
                    <label className={`exp-form-labels ${error && !status ? 'text-danger' : ''}`}>
                      Status<span className="text-danger">*</span>
                    </label>
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
                    <label for="lname" className={`exp-form-labels ${error && !expiryDate ? 'text-danger' : ''}`}>
                      Expiry Date<span className="text-danger">*</span>
                    </label>
                    <input
                      id="depName"
                      className="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required
                      min={today}
                      value={expiryDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;

                        if (selectedDate < today) {
                          return;
                        }

                        setExpiryDate(selectedDate);
                      }}
                    />
                  </div>
                </div>
                
                {mode === "create" && (
                  <div className="col-md-3 form-group">
                    <div class="exp-form-floating"> <label for="lname" className={`exp-form-labels ${error && !companyName ? 'text-danger' : ''}`}>
                      Face Capture<span className="text-danger">*</span>
                    </label>
                      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam exp-input-field form-control" />
                    </div>
                  </div>
                )}

              </div>
              <div data-tooltip-class-name="row">
                <div class="form-group d-flex justify-content-end p-2">
                  {mode === "create" ? (
                    <button
                      onClick={handleInsert}
                      className="mt-3"
                      title="Save"
                    >
                      <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdate}
                      className="mt-3"
                      title="Update"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddVisitorMaster;