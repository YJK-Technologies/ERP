import React, { useState, useEffect, useRef } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import './/EmployeeLoan.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import './apps.css'
import Select from 'react-select'
import { showConfirmationToast } from './ToastConfirmation';
import { AgGridReact } from "ag-grid-react";
import * as XLSX from "xlsx";


const config = require('./Apiconfig');

function GatePass({ }) {

  const [error, setError] = useState("");
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [filtercode, setFilterCode] = useState('');
  const [rowData, setrowData] = useState([]);
  const [Entry_date_Time, setEntry_date_Time] = useState('');
  const [Visitor_ID, setVisitor_ID] = useState("");
  const [Visitor_IDsearch, setVisitor_IDsearch] = useState("");
  const [selectedVisitor_ID, setselectedVisitor_ID] = useState("");
  const [selectedVisitor_IDsearch, setselectedVisitor_IDsearch] = useState("");
  const [Visitor_Name, setVisitor_Name] = useState("");
  const [Purpose, setPurpose] = useState("");
  const [StartDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [Vehicle_Number, setVehicle_Number] = useState("");
  const [Tag_No, setTag_No] = useState("");
  const [Tag_NoSC, setTag_NoSC] = useState("");
  const [Phone_No, setPhone_No] = useState("");
  const [ID_Proof_No, setID_Proof_No] = useState("");
  const [Vehicle_NumberSC, setVehicle_NumberSC] = useState("");
  const [Remarks, setRemarks] = useState("");
  const [visitordrop, setvisitordrop] = useState([]);
  const [visitordropSC, setvisitordropSC] = useState([]);
  const [showAsterisk, setShowAsterisk] = useState(true)
  const [Status, setstatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [StatusSC, setstatusSC] = useState("");
  const [setpurposesc, setPurposeSC] = useState('');
  const [selectedStatusSC, setSelectedStatusSC] = useState([]);
  const [selectedPurposesc, setselectedPurposeSC] = useState([]);
  const [selectedPurpose, setselectedPurpose] = useState([]);
  const [statusdropSC, setStatusdropSC] = useState([]);
  const [purposedrop, setpurposedrop] = useState([]);
  const [IdProofTyprDrop, setidProofTypeDrop] = useState([]);
  const [CustomerTypeDrop, setcustomerTypeDrop] = useState([]);
  const [StatusDrop, setstatusDrop] = useState([]);
  const [PurposeDrop, setpurposeDrop] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    return localStorage.getItem("isCheckedIn") === "true";
  });
  const intervalRef = useRef(null);
  const [timer, setTimer] = useState("00:00:00");
  const hasStoppedRef = useRef(false);
  const [showCheckInText, setShowCheckInText] = useState(true);
  const [visitorImage, setVisitorImage] = useState(null);
  const [isExpired, setIsExpired] = useState(false);


  const handleSearch = async () => {
    const start = new Date(StartDate);
    const end = new Date(EndDate);

    if (end < start) {
      toast.warning("End Date should not be earlier than Start Date");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/VisitorSC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Purpose: filtercode,
          Visitor_ID: Visitor_IDsearch,
          StartDate: StartDate,
          Visitor_Name: Visitor_Name,
          EndDate: EndDate,
          Vehicle_Number: Vehicle_NumberSC,
          // Status: StatusSC,
          Purpose: setpurposesc,
          Tag_No: Tag_NoSC,
          Phone_No: Phone_No,
          ID_Proof_No: ID_Proof_No,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        setrowData(searchData);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setrowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        setrowData([]);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setEntry_date_Time(today);
    setStartDate(today);
    setEndDate(today);
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

  // const handleRowCheckout = async (rowData) => {
  //   try {
  //     const now = new Date().toISOString();

  //     const response = await fetch(
  //       `${config.apiBaseUrl}/Gate_Pass_TransactionInsert`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           Visitor_ID: rowData.Visitor_ID,
  //           check_out: now,
  //           company_code: sessionStorage.getItem("selectedCompanyCode"),
  //           Modified_by: sessionStorage.getItem("selectedUserCode"),
  //           mode: "CO",               // 👈 checkout mode
  //           Keyfield: rowData.Keyfield
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       const err = await response.json();
  //       toast.error(err.message || "Checkout failed");
  //       return;
  //     }

  //     toast.success("Checked out successfully ✅");

  //     reloadGridData(); // 🔄 auto refresh grid
  //   } catch (error) {
  //     toast.error("Server error while checkout");
  //   }
  // };

  //  const checkoutVisitor = async (Visitor_ID) => {
  //   if (!Visitor_ID) {
  //     toast.error("Visitor ID is required");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionInsert`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         mode: "CO",
  //         Visitor_ID, // directly use Visitor_ID
  //         company_code: sessionStorage.getItem("selectedCompanyCode"),
  //         Modified_by: sessionStorage.getItem("selectedUserCode"),
  //       }),
  //     });

  //     const result = await response.json();
  //     if (!response.ok) {
  //       toast.error(result.message || "Checkout failed");
  //       return;
  //     }

  //     toast.success("Checked out successfully ✅");
  //     reloadGridData();
  //   } catch (err) {
  //     toast.error("Checkout failed");
  //   }
  // };

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/getPurpose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((data) => {
        const purposeOption = data.map((option) => option.attributedetails_name);
        setpurposeDrop(purposeOption);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);


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
                  onClick={() => saveEditedData(params.data, params.node.data)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-regular fa-floppy-disk" title="Save"></i>
                </span>

                <span
                  className="icon mx-2"
                  onClick={() => deleteSelectedRows(params.data)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-trash" title="Delete"></i>
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      headerName: "Check-Out",
      field: "checkoutAction",
      cellRenderer: (params) => {
        const isCheckedOut = !!params.data.Check_Out;

        return (
          <button
            className={`btn btn-sm ${isCheckedOut ? "btn-secondary" : "btn-danger"
              }`}
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={() =>
              fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionHandler`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  Visitor_ID: params.data.Visitor_ID,
                  Trans_Screen: "MANUAL CHECK OUT",
                  Entry_date_Time: params.data.Entry_date_Time,
                  company_code: sessionStorage.getItem("selectedCompanyCode"),
                  Modified_by: sessionStorage.getItem("selectedUserCode"),
                  mode: "CO",
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    toast.success(data.message);
                    reloadGridData();
                  } else {
                    toast.error(data.message);
                  }
                })
                .catch(() => toast.error("Checkout failed"))
            }
            disabled={params.data.Check_Out}
          >
            Check OUT
          </button>
        );
      },
    },
    {
      headerName: "Check-IN",
      field: "check_in",
      editable: false,
      cellStyle: { textAlign: "left" },

      // valueFormatter: (params) => {
      //   if (!params.value) return "";

      //   const d = new Date(params.value);

      //   const day = String(d.getDate()).padStart(2, "0");
      //   const month = String(d.getMonth() + 1).padStart(2, "0");
      //   const year = d.getFullYear();

      //   const hh = String(d.getHours()).padStart(2, "0");
      //   const mm = String(d.getMinutes()).padStart(2, "0");
      //   const ss = String(d.getSeconds()).padStart(2, "0");

      //   return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
      // },
    },
    {
      headerName: "Check-Out",
      field: "Check_Out",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
      // valueFormatter: (params) => {
      //   if (!params.value) return "";

      //   const d = new Date(params.value);

      //   const day = String(d.getDate()).padStart(2, "0");
      //   const month = String(d.getMonth() + 1).padStart(2, "0");
      //   const year = d.getFullYear();

      //   const hh = String(d.getHours()).padStart(2, "0");
      //   const mm = String(d.getMinutes()).padStart(2, "0");
      //   const ss = String(d.getSeconds()).padStart(2, "0");

      //   return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
      // },
    },
    {
      headerName: "Entry date",
      field: "Entry_date_Time",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 18,
      },
      valueGetter: (params) => {
        if (!params.data?.Entry_date_Time) return "";
        return params.data.Entry_date_Time.split("T")[0];
      }
    },
    {
      headerName: "Visitor ID",
      field: "Visitor_ID",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Visitor Name",
      field: "Visitor_Name",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Vehicle Number",
      field: "Vehicle_Number",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 15,
      },
    },
    {
      headerName: "Contact No",
      field: "Phone_No",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "ID Proof",
      field: "ID_Proof",
      cellEditor: "agSelectCellEditor",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 18,
        values: IdProofTyprDrop,
      },
    },
    {
      headerName: "Purpose",
      field: "Purpose",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
        values: PurposeDrop,
      },
    },
    {
      headerName: "Tag No",
      field: "Tag_No",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 30,
      },
    },
    {
      headerName: "Company Name",
      field: "Company_Name",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 30,
      },
    },
    {
      headerName: "Customer Type",
      field: "Customer_type",
      cellEditor: "agSelectCellEditor",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 18,
        values: CustomerTypeDrop,
      },
    },
    {
      headerName: "ID Proof No",
      field: "ID_Proof_No",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 10,
      },
    },
    // {
    //   headerName: "Status",
    //   field: "Status",
    //   editable: true,
    //   cellStyle: { textAlign: "left" },
    //   cellEditor: "agSelectCellEditor",
    //   cellEditorParams: {
    //     maxLength: 18,
    //     values: StatusDrop,
    //   },
    // },
    {
      headerName: "Expiry Date",
      field: "Expired_Date",
      editable: false,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        maxLength: 18,
      },
      valueGetter: (params) => {
        if (!params.data?.Expired_Date) return "";
        return params.data.Expired_Date.split("T")[0];
      }
    },
    {
      headerName: "In/Out Type",
      field: "Trans_Screen",
      editable: false,
      width: 400,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: "Remarks",
      field: "Remarks",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Keyfield",
      field: "Keyfield",
      editable: true,
      hide: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 250,
      },
    }
  ];

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };

  const handlevisitor = (selectedOption) => {
    const keyfield = selectedOption ? selectedOption.value : "";

    setselectedVisitor_ID(selectedOption);
    setVisitor_ID(keyfield);

    if (!keyfield) return;

    fetch(`${config.apiBaseUrl}/Expired`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Keyfield: keyfield }),
    })
      .then(res => res.json())
      .then(data => {

        if (data.image) {
          setVisitorImage(data.image);
        } else {
          setVisitorImage(null);
        }

        if (data?.message && data.message !== "VALID") {
          toast.error(data.message, {
            autoClose: 3000,
            onClose: () => {
              window.location.reload();
            },
          });
          setIsExpired(true);
        } else {
          setIsExpired(false);
        }
      })
      .catch(err => {
        console.error(err);
        setVisitorImage(null);
      });
  };

  const handlevisitorSC = (selectedOption) => {
    setselectedVisitor_IDsearch(selectedOption);
    setVisitor_IDsearch(selectedOption ? selectedOption.value : "");
  };

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
  };

  const handleChangeStatusSC = (selectedStatus) => {
    setSelectedStatusSC(selectedStatus);
    setstatusSC(selectedStatus ? selectedStatus.value : '');
  };

  const handleChangePurpose = (selectedPurpose) => {
    setselectedPurpose(selectedPurpose);

    if (!selectedPurpose || selectedPurpose.length === 0) {
      setPurpose("");
      return;
    }

    const values = selectedPurpose.map(opt => opt.value);

    setPurpose(values.join(","));
  };

  const handleChangePurposeSC = (selectedPurpose) => {
    setselectedPurposeSC(selectedPurpose);

    if (!selectedPurpose || selectedPurpose.length === 0) {
      setPurposeSC("");
      return;
    }

    const values = selectedPurpose.map(opt => opt.value);

    setPurposeSC(values.join(","));
  };

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionStatusSC = statusdropSC.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionPurpose = purposedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code }),
    })
      .then((response) => response.json())
      .then((val) => {
        setStatusdrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          setSelectedStatus(firstOption);
          setstatus(firstOption.value);
        }
      })
      .catch((error) => {
        console.error('Error fetching status data:', error);
      });
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code }),
    })
      .then((response) => response.json())
      .then((val) => {
        setStatusdropSC(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          setSelectedStatusSC(firstOption);
          setstatusSC(firstOption.value);
        }
      })
      .catch((error) => {
        console.error('Error fetching status data:', error);
      });
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/getPurpose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code }),
    })
      .then((response) => response.json())
      .then((val) => {
        setpurposedrop(val);

        if (val.length > 0) {
          const firstOption = {
            value: val[0].attributedetails_name,
            label: val[0].attributedetails_name,
          };
          // setselectedPurposeSC(firstOption);
          setpurposesc(firstOption.value);
        }
      })
      .catch((error) => {
        console.error('Error fetching status data:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/GetVisitor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((res) => res.json())
      .then((val) => {
        setvisitordrop(Array.isArray(val) ? val : []);
      });
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/GetVisitor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((res) => res.json())
      .then((val) => {
        setvisitordropSC(Array.isArray(val) ? val : []);
      });
  }, []);

  const filterOptionVisitor = Array.isArray(visitordrop)
    ? visitordrop.map(option => ({
      value: option.Keyfield,
      label: option.Keyfield,
    }))
    : [];

  const filterOptionVisitorSC = Array.isArray(visitordropSC)
    ? visitordropSC.map(option => ({
      value: option.Keyfield,
      label: option.Keyfield,
    }))
    : [];

  // const handleSave = async () => {
  //   if (
  //     !Entry_date_Time ||
  //     !Purpose ||
  //     !Vehicle_Number
  //   ) {
  //     setError(" ");
  //     toast.warning("Error: Missing required fields");
  //     return;
  //   }
  //   try {
  //     const Header = {
  //       Entry_date_Time,
  //       Visitor_ID,
  //       Purpose,
  //       Vehicle_Number,
  //       Remarks,
  //       Status,
  //       company_code: sessionStorage.getItem('selectedCompanyCode'),
  //       Created_by: sessionStorage.getItem('selectedUserCode'),
  //     };

  //     const response = await fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionInsert`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(Header),
  //     });

  //     if (response.status === 200) {
  //       console.log("Data inserted successfully");
  //       setTimeout(() => {
  //         toast.success("Data inserted successfully!", {
  //           onClose: () => window.location.reload(),
  //         });
  //       }, 1000);
  //     } else {
  //       const errorResponse = await response.json();
  //       toast.warning(errorResponse.message || "Failed to insert EmployeeLeave data");
  //       console.error(errorResponse.details || errorResponse.message);
  //     }
  //   } catch (error) {
  //     console.error("Error inserting data:", error);
  //     toast.error('Error inserting data: ' + error.message);
  //   }
  // };

  const saveEditedData = async () => {
    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        try {
          const company_code = sessionStorage.getItem('selectedCompanyCode');
          const modified_by = sessionStorage.getItem('selectedUserCode');

          const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

          const response = await fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionLoopUpdate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": company_code,
              "modified_by": modified_by
            },
            body: JSON.stringify(dataToSend)
          });

          if (response.ok) {
            toast.success("Data updated successfully", {
              onClose: () => handleSearch(), // Runs handleSearch when toast closes
            });
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
    const LeaveIdDelete = { LeaveIdToDelete: Array.isArray(rowData) ? rowData : [rowData] };

    showConfirmationToast(
      "Are you sure you want to delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionLoopDelete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(LeaveIdDelete),
          });

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data deleted successfully");
              handleSearch();
            }, 3000);
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

  const reloadGridData = () => {
    window.location.reload();
  };

  const reload = () => {
    window.location.reload();
  }

  const reloadData = () => {
    setStartDate('');
    setEndDate('');
    setVisitor_Name('');
    setVehicle_NumberSC('');
    setTag_NoSC('');
    setPhone_No('');
    setID_Proof_No('');
    setselectedVisitor_IDsearch(null);
    setSelectedStatusSC(null);
    setselectedPurposeSC([]);
    setrowData([]);
    // fetchData();
  };

  useEffect(() => {
    if (isCheckedIn) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn]);


  const startTimer = () => {
    hasStoppedRef.current = false;

    let storedElapsedTime = parseInt(localStorage.getItem("elapsedTime")) || 0;

    let startTime =
      parseInt(localStorage.getItem("startTime")) ||
      Date.now() - storedElapsedTime * 1000;

    localStorage.setItem("startTime", startTime);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      localStorage.setItem("elapsedTime", elapsedTime);

      const h = String(Math.floor(elapsedTime / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, "0");
      const s = String(elapsedTime % 60).padStart(2, "0");

      setTimer(`${h}:${m}:${s}`);
    }, 1000);
  };


  const stopTimer = () => {
    if (hasStoppedRef.current) return;
    hasStoppedRef.current = true;

    clearInterval(intervalRef.current);

    const startTime = parseInt(localStorage.getItem("startTime"));
    const currentTime = Date.now();

    let lastElapsedTime = 0;
    if (!isNaN(startTime)) {
      lastElapsedTime = Math.floor((currentTime - startTime) / 1000);
    }

    console.log("Calculated Elapsed Time:", lastElapsedTime);

    localStorage.setItem("lastElapsedTime", lastElapsedTime);
    localStorage.removeItem("elapsedTime");
    localStorage.removeItem("startTime");
  };

  const handleTime = async () => {
    try {
      const now = new Date().toISOString();

      const response = await fetch(
        `${config.apiBaseUrl}/Gate_Pass_TransactionInsert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Visitor_ID,
            Purpose,
            Vehicle_Number,
            Entry_date_Time,
            Remarks,
            // Status,
            Tag_No,
            Trans_Screen: 'MANUAL CHECK IN',
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            Created_by: sessionStorage.getItem("selectedUserCode"),
            // check_in: now,      
            // check_out: null,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        toast.error(err.message || "Check-in failed");
        return;
      }

      toast.success("Check-in saved successfully ✅"); 

      // Optional: refresh grid / clear form
      // reloadGridData();

    } catch (error) {
      toast.error("Server error. Please try again.");
    }
  };

  const transformData = (data) => {
    return data.map(row => ({
      "Check-IN": formatDateTime(row.check_in),
      "Check-Out": formatDateTime(row.Check_Out),
      "Entry date": formatDateOnly(row.Entry_date_Time),
      "Visitor ID": row.Visitor_ID,
      // "Visitor Name": new Date(row.StartDate).toISOString().split('T')[0], // 'YYYY-MM-DD'
      // "Vehicle Number": new Date(row.EndDate).toISOString().split('T')[0], // 'YYYY-MM-DD'
      "Visitor Name": row.Visitor_Name, // 'YYYY-MM-DD'
      "Vehicle Number": row.Vehicle_Number, // 'YYYY-MM-DD'
      "Expiry Date": formatDateOnly(row.Expired_Date),
      "Phone No": row.Phone_No,
      "ID Proof": row.ID_Proof,
      "ID Proof No": row.ID_Proof_No,
      "Purpose": row.Purpose,
      "Tag No": row.Tag_No,
      "Company Name": row.Company_Name,
      "Customer Type": row.Customer_type,
      // "Status": row.Status,
      "IN/Out Type": row.Trans_Screen,
      "Remakrs": row.Remarks
    }));
  };

  const handleExcel = () => {
    if (rowData.length === 0) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [
      ['Gate Pass'],
    ];

    const transformedData = transformData(rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gate_Pass');
    XLSX.writeFile(workbook, 'Gate Pass.xlsx');
  };

  const formatDateOnly = (value) => {
    if (!value) return "";
    const d = new Date(value);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
  };

  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className="shadow-lg p-3 bg-white rounded">
            <div className="d-flex justify-content-between align-items-center">

              <h2 className="mb-0 gatepass-title">Gate Pass</h2>

              <div className="d-flex align-items-center gap-3">

                {/* <input
        className="form-control text-center"
        type="text"
        readOnly
        value={timer}
        style={{ width: "100px" }}
      /> */}

                {!isExpired && (
                  <button
                    onClick={handleTime}
                    className="btn d-flex align-items-center gap-2 px-3"
                    style={{
                      backgroundColor: "#0a8f08",
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    <i className="fa-solid fa-clock"></i>
                    Check IN
                  </button>
                )}

                <div>
                  <icon
                    className="popups-btn fs-6 p-3"
                    required
                    onClick={reload}
                    title="Reload"
                  >
                    <i class="fa-solid fa-rotate-right"></i>
                  </icon>
                </div>


                {/* <button
        className="btn btn-light border"
        onClick={reloadGridData}
        title="Reload"
      >
        <i className="fa-solid fa-arrow-rotate-right"></i>
      </button> */}

              </div>
            </div>
          </div>

          <div class=" mb-4">
            <div className="shadow-lg p-3 mt-2 bg-white rounded-bottom rounded-top mb-2">
              <div class="row ms-2">
                <div className="col-md-10">
                  <div class="row">
                    <div className="col-md-4 form-group mb-2">
                      <div class="exp-form-floating">
                        <div class="d-flex justify-content-start">
                          <div>
                            <label for="state" className={`${error && !Entry_date_Time ? 'red' : ''}`}>Entry Date{showAsterisk && <span className="text-danger">*</span>}</label>
                          </div>
                          <div>
                          </div>
                        </div>
                        <input
                          id="Entry_date_Time"
                          className="exp-input-field form-control"
                          type="date"
                          placeholder=""
                          required title="Please Enter the Leave ID"
                          value={Entry_date_Time}
                          onChange={(e) => setEntry_date_Time(e.target.value)}
                          maxLength={150}
                        />
                      </div>
                    </div>
                    <div className="col-md-4 form-group mb-2">
                      <div class="exp-form-floating">
                        <div class="d-flex justify-content-start">
                          <div>
                            <label for="sname" className={`${error && !Visitor_ID ? 'red' : ''}`}>Visitor ID
                              {showAsterisk && <span className="text-danger">*</span>}</label>
                          </div>
                        </div>
                        <Select
                          id="Visitor_ID"
                          class="exp-input-field form-control"
                          placeholder=""
                          value={selectedVisitor_ID}
                          onChange={handlevisitor}
                          options={filterOptionVisitor}
                        />
                      </div>
                    </div>
                    <div className="col-md-4 form-group mb-2">
                      <div class="exp-form-floating">
                        <div class="d-flex justify-content-start">
                          <div> <label for="add1" className={`${error && !Purpose ? 'red' : ''}`}>Purpose{showAsterisk && <span className="text-danger">*</span>}</label>
                          </div>
                        </div>
                        <Select
                          id="code"
                          class="exp-input-field form-control"
                          onChange={handleChangePurpose}
                          isMulti
                          value={selectedPurpose}
                          options={filteredOptionPurpose}
                        />
                      </div>
                    </div>

                    <div className="col-md-4 form-group mb-2">
                      <div class="exp-form-floating">
                        <div class="d-flex justify-content-start">
                          <div>
                            <label For="city" className={`${error && !Vehicle_Number ? 'red' : ''}`}>Vehicle No{showAsterisk && <span className="text-danger">*</span>}</label>
                          </div>
                        </div>
                        <input
                          id="Vehicle_Number"
                          class="exp-input-field form-control"
                          type="text"
                          placeholder=""
                          maxLength={30}
                          required title="Please Enter the Value for Total Days to be Credit "
                          value={Vehicle_Number}
                          onChange={(e) => setVehicle_Number(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-4 form-group mb-2">
                      <div class="exp-form-floating">
                        <div class="d-flex justify-content-start">
                          <div>
                            <label For="city" >Tag No</label>
                          </div>
                        </div>
                        <input
                          id="Vehicle_Number"
                          class="exp-input-field form-control"
                          type="text"
                          placeholder=""
                          maxLength={30}
                          required title="Please Enter the Value for Total Days to be Credit "
                          value={Tag_No}
                          onChange={(e) => setTag_No(e.target.value)}
                        />
                      </div>
                    </div>

                    {/*<div className='col-md-4 form-group'>
                      <div className='exp-form-floating'>
                        <label>Status</label>
                        <Select
                          type='Text'
                          className='exp p-1'
                          onChange={handleChangeStatus}
                          value={selectedStatus}
                          required title="Please Select the User ID"
                          options={filteredOptionStatus}
                        />
                      </div>
                    </div>*/}

                    <div className="col-md-12 form-group mb-2">
                      <div className="exp-form-floating">
                        <div className="d-flex justify-content-start">
                          <div>
                            <label htmlFor="Remarks">Remarks</label>
                          </div>
                        </div>

                        <textarea
                          id="Remarks"
                          className="exp-input-field form-control"
                          placeholder=""
                          required
                          title="Please Enter the Value for Exceed Leave"
                          value={Remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                    </div>
                  </div>
                </div>

                <div className="col-md-2 d-flex justify-content-center align-items-start">
                  <div className="visitor-image-box">
                    {visitorImage ? (
                      <img
                        src={visitorImage}
                        alt="Visitor"
                        className="visitor-image"
                      />
                    ) : (
                      <div className="image-placeholder">
                        Image
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="shadow-lg p-3 bg-light rounded-3 mb-2">
              <div class="row">
                <h6 className="">Search Criteria:</h6>
                <div className="d-flex justify-content-end me-5">
                  <button className="btn btn-dark  mb-2 rounded-3" style={{ marginTop: "-15px" }} onClick={handleExcel} title='Excel'>
                    <i class="fa-solid fa-file-excel"></i>
                  </button></div>
                <div class="row ms-2 me-2">
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div><label for="cname" class="exp-form-labels">
                        Start Date
                      </label></div>
                      <input
                        type="date"
                        className="exp-input-field form-control"
                        placeholder=""
                        required title="Please Enter the Leave ID"
                        value={StartDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div><label for="cname" class="exp-form-labels">
                        End Date
                      </label></div>
                      <input
                        type="date"
                        className="exp-input-field form-control"
                        placeholder=""
                        required title="Please Enter the Leave ID"
                        value={EndDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label for="sname" >Visitor ID
                          </label>
                        </div>
                      </div>
                      <Select
                        id="Visitor_ID"
                        class="exp-input-field form-control"
                        placeholder=""
                        value={selectedVisitor_IDsearch}
                        onChange={handlevisitorSC}
                        options={filterOptionVisitorSC}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label For="city">Visitor Name</label>
                        </div>
                      </div>
                      <input
                        id="Vehicle_Number"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        value={Visitor_Name}
                        onChange={(e) => setVisitor_Name(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label For="city">Vehicle No</label>
                        </div>
                      </div>
                      <input
                        id="Vehicle_Number"
                        class="exp-input-field form-control"
                        type="text"
                        maxLength={30}
                        placeholder=""
                        required title="Please Enter the Value for Total Days to be Credit "
                        value={Vehicle_NumberSC}
                        onChange={(e) => setVehicle_NumberSC(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label For="city">Tag No</label>
                        </div>
                      </div>
                      <input
                        id="Vehicle_Number"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        maxLength={30}
                        required title="Please Enter the Value for Total Days to be Credit "
                        value={Tag_NoSC}
                        onChange={(e) => setTag_NoSC(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label For="city">Contact No </label>
                        </div>
                      </div>
                      <input
                        id="Vehicle_Number"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required title="Please Enter the Value for Total Days to be Credit "
                        value={Phone_No}
                        maxLength={15}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setPhone_No(value)
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label For="city">ID Proof No</label>
                        </div>
                      </div>
                      <input
                        id="Vehicle_Number"
                        class="exp-input-field form-control"
                        type="text"
                        maxLength={30}
                        placeholder=""
                        required title="Please Enter the Value for Total Days to be Credit "
                        value={ID_Proof_No}
                        onChange={(e) => setID_Proof_No(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* <div className='col-md-3 form-group'>
                    <div className='exp-form-floating'>
                      <label>Status</label>
                      <Select
                        type='Text'
                        className='exp p-1'
                        onChange={handleChangeStatusSC}
                        value={selectedStatusSC}
                        required title="Please Select the User ID"
                        options={filteredOptionStatusSC}
                      />
                    </div>
                  </div> */}
                  <div className='col-md-3 form-group'>
                    <div className='exp-form-floating'>
                      <label>Purpose</label>
                      <Select
                        type='Text'
                        className='exp p-1'
                        onChange={handleChangePurposeSC}
                        value={selectedPurposesc}
                        options={filteredOptionPurpose}
                        isMulti
                        placeholder="Select purpose"
                      />
                    </div>
                  </div>

                  <div className="col-md-2 form-group mt-3 mb-3">
                    <div class="exp-form-floating">
                      <div class=" d-flex justify-content-center ">
                        <div class="">
                          <icon
                            className="popups-btn fs-6 p-3"
                            onClick={handleSearch}
                            required
                            title="Search"
                          >
                            <i className="fas fa-search"></i>
                          </icon>
                        </div>
                        <div>
                          <icon
                            className="popups-btn fs-6 p-3"
                            required
                            onClick={reloadData}
                            title="Reload"
                          >
                            <i class="fa-solid fa-rotate-right"></i>
                          </icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
                  <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    rowSelection="multiple"
                    pagination={true}
                    paginationAutoPageSize={true}
                    gridOptions={gridOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
export default GatePass;