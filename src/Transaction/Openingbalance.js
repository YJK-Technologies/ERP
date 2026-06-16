import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "../apps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import OIPopup from "../OpeningItemHelp.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PurchaseItemPopup from "../PurchaseItemPopup";
import { showConfirmationToast } from "../ToastConfirmation";
import PoCustomerPopup from "../SalesVendorPopup";
import PoVendorPopup from "../PurchaseVendorPopup";
import LoadingScreen from "../Loading";
import ObPopup from "../OBPopup";

const config = require("../Apiconfig");

function Openingbalance() {
  const getFinancialYearDate = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    return `${startYear}-04-01`;
  };
  const [rowData, setRowData] = useState([
    {
      serialNumber: 1,
      TransactionNo: "",
      entry_date: getFinancialYearDate(),
      party_type: "",
      party_code: "",
      itemName: "",
      balance_type: "",
      opening_amount: "",
      remarks: "",
    },
  ]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [transaction_date, settransaction_date] = useState("");
  const [transaction_no, settransaction_no] = useState("");
  const [additionalData, setAdditionalData] = useState({
    modified_by: "",
    created_by: "",
    modified_date: "",
    created_date: "",
  });
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [party, setParty] = useState(null);
  const [partyDrop, setPartyDrop] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [balance_typeDrop, setbalance_typeDrop] = useState([]);
  const [isExistingData, setIsExistingData] = useState(false);
  const [showStatusColumn, setShowStatusColumn] = useState(false);
  const [showTransactionColumn, setShowTransactionColumn] = useState(false);
  const [statusdrop, setStatusdrop] = useState([]);

  const [financialYear, setFinancialYear] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [partyType, setPartyType] = useState("");
  const [partyCode, setPartyCode] = useState("");
  const [openingAmount, setOpeningAmount] = useState("");
  const [balanceType, setBalanceType] = useState("");
  const [remarks, setRemarks] = useState("");

  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || {};
  const openingItemPermission = permissions
    .filter((permission) => permission.screen_type === "OpeningItem")
    .map((permission) => permission.permission_type.toLowerCase());

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const financialYearStartDate = `${startYear}-04-01`;
    settransaction_date(financialYearStartDate);
  }, []);

  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber;
    setGlobal(GlobalSerialNumber);

    const selectedPartType = params.data.party_type;

    if (!selectedPartType) {
      toast.warning("Please select Party Type");
      return;
    }

    if (selectedPartType === "Customer") {
      setOpen2(true);
    } else if (selectedPartType === "Vendor") {
      setOpen4(true);
    } else {
      toast.warning("Invalid Party Type Selected");
    }
  };

  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-12

    // FY starts April 1
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  // const handleCustomerSelect = async (selectedData) => {
  //   let updatedRowDataCopy = [...rowData];

  //   updatedRowDataCopy = updatedRowDataCopy.map((row) => {
  //     if (row.serialNumber === global) {
  //       return {
  //         ...row,
  //         itemCode: selectedData.customer_code,
  //         itemName: selectedData.customer_name,
  //       };
  //     }
  //     return row;
  //   });

  //   setRowData(updatedRowDataCopy);
  //   setOpen2(false);
  // };

  // const handleVendorSelect = async (selectedData) => {
  //   let updatedRowDataCopy = [...rowData];

  //   updatedRowDataCopy = updatedRowDataCopy.map((row) => {
  //     if (row.serialNumber === global) {
  //       return {
  //         ...row,
  //         itemCode: selectedData.vendor_code,
  //         itemName: selectedData.vendor_name,
  //       };
  //     }
  //     return row;
  //   });

  //   setRowData(updatedRowDataCopy);
  //   setOpen4(false);
  // };

  const handleUpdateRow = async (row) => {
    try {
      const payload = {
        mode: "U",
        transaction_no: row.TransactionNo || row.transaction_no,
        financial_year: getFinancialYear(),
        entry_date: row.entry_date,
        party_type: row.party_type,
        party_code: row.party_code,
        keyfield: row.keyfield,
        opening_amount: parseFloat(row.opening_amount),
        balance_type: row.balance_type,
        remarks: row.remarks,
        status: row.status,
        data_deleted: false,

        company_code: sessionStorage.getItem("selectedCompanyCode"), // 🔥 FIX
        created_by: sessionStorage.getItem("selectedUserCode"), // 🔥 FIX
        Location_Code: sessionStorage.getItem("selectedLocationCode"),
        created_date: new Date(),
        modified_by: sessionStorage.getItem("selectedUserCode"),
        modified_date: new Date(),
      };

      console.log("UPDATE PAYLOAD:", payload);

      const response = await fetch(
        `${config.apiBaseUrl}/opening_balanceLoopUpdate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opening_balanceData: [payload] }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Updated Successfully");
      } else {
        toast.error(data.message || "Update Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating row");
    }
  };

  const handleDeleteRow = async (rowData) => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const Location_Code = sessionStorage.getItem("selectedLocationCode");
    const modified_by = sessionStorage.getItem("selectedUserCode");

    const opening_balanceDelete = {
      opening_balanceData: Array.isArray(rowData)
        ? rowData.map((row) => ({
            ...row,
            company_code,
            Location_Code,
            modified_by,
          }))
        : [
            {
              ...rowData,
              company_code,
              Location_Code,
              modified_by,
            },
          ],
    };

    showConfirmationToast(
      "Are you sure you want to delete the selected row?",
      async () => {
        try {
          console.log("Delete Payload :", opening_balanceDelete);

          const response = await fetch(
            `${config.apiBaseUrl}/opening_balanceLoopDelete`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                company_code: company_code,
              },
              body: JSON.stringify(opening_balanceDelete),
            },
          );

          const data = await response.json();
          if (response.ok) {
            toast.success("Row Deleted Successfully");
            setRowData((prevRows) =>
              prevRows.filter(
                (item) => item.serialNumber !== rowData.serialNumber,
              ),
            );
          } else {
            toast.error(data.message || "Delete Failed");
          }
        } catch (error) {
          console.error(error);
          toast.error("Error while deleting row");
        }
      },
      () => {
        toast.info("Delete cancelled");
      },
    );
  };

  const filteredOptionParty = Array.isArray(partyDrop)
    ? partyDrop.map((option) => ({
        value: option.descriptions,
        label: option.descriptions,
      }))
    : [];

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getGSTReport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPartyDrop(data);
        const defaultParty =
          data.find((item) => item.descriptions === "Customer") || data[0];
        if (defaultParty) {
          setSelectedParty({
            value: defaultParty.descriptions,
            label: defaultParty.descriptions,
          });
          setParty(defaultParty.descriptions);
        }
      })
      .catch((error) => console.error("Error fetching invoice types:", error));
  }, []);

  const partTypeOptions = Array.isArray(partyDrop)
    ? partyDrop.map((option) => option.descriptions)
    : [];

  const filteredOptionBT = balance_typeDrop.map((option) => ({
    value: option.attributedetails_code,
    label: `${option.attributedetails_code} - ${option.attributedetails_name}`,
  }));

  const balanceTypeOptions = balance_typeDrop.map(
    (option) => option.attributedetails_code,
  );

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/getbalance_type`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((data) => {
        setbalance_typeDrop(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

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
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "S.No",
        field: "serialNumber",
        maxWidth: 100,
        sortable: false,
        editable: false,
        // checkboxSelection: true,
        // headerCheckboxSelection: true,
      },
      {
        headerName: "Action",
        field: "action",
        hide: !isExistingData,
        editable: false,
        sortable: false,
        filter: false,
        minWidth: 140,
        cellRenderer: (params) => {
          return (
            <div className="d-flex gap-2 mt-1">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleUpdateRow(params.data)}
              >
                Update
              </button>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteRow(params.data)}
              >
                Delete
              </button>
            </div>
          );
        },
      },
      {
        headerName: "Transaction No",
        field: "TransactionNo",
        sortable: false,
        editable: false,
        hide: !showTransactionColumn,
      },
      {
        headerName: "Transaction Date",
        field: "entry_date",
        sortable: false,
        hide: true,
        editable: false,
        valueFormatter: (params) => {
          if (!params.value) return "";

          const date = new Date(params.value);

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");

          return `${year}-${month}-${day}`;
        },
      },
      {
        headerName: "Party Type",
        field: "party_type",
        editable: !showAsterisk,
        filter: true,
        sortable: false,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: partTypeOptions,
        },
        singleClickEdit: true,
      },
      {
        headerName: "Party Code",
        field: "party_code",
        editable: !showAsterisk,
        filter: true,
        sortable: false,
        cellRenderer: (params) => {
          const cellWidth = params.column.getActualWidth();
          const showSearchIcon = cellWidth > 30;

          return (
            <div
              className="position-relative d-flex align-items-center"
              style={{ minHeight: "100%" }}
            >
              <div className="flex-grow-1">{params.value}</div>

              {showSearchIcon && (
                <span
                  className="icon searchIcon"
                  style={{
                    position: "absolute",
                    right: "-10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => handleClickOpen(params)}
                >
                  <i className="fa fa-search"></i>
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: "Party Name",
        field: "itemName",
        editable: false,
        sortable: false,
        filter: true,
      },
      {
        headerName: "Balance Type",
        field: "balance_type",
        editable: !showAsterisk,
        filter: true,
        sortable: false,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: balanceTypeOptions,
        },
        singleClickEdit: true,
        valueFormatter: (params) => {
          const selected = filteredOptionBT.find(
            (item) => item.value === params.value,
          );

          return selected ? selected.label : params.value;
        },
      },
      {
        headerName: "Opening Amount",
        field: "opening_amount",
        editable: !showAsterisk,
        filter: true,
        sortable: false,

        valueParser: (params) => {
          const value = parseFloat(params.newValue);
          return isNaN(value) ? "" : value;
        },
      },
      {
        headerName: "Remarks",
        field: "remarks",
        editable: !showAsterisk,
        filter: true,
        sortable: false,
      },
      {
        headerName: "Financial Year",
        field: "financial_year",
        editable: !showAsterisk,
        filter: true,
        hide: true,
        sortable: false,
      },
      {
        headerName: "Keyfield",
        field: "keyfield",
        editable: !showAsterisk,
        filter: true,
        hide: true,
        sortable: false,
      },
      {
        headerName: "Status",
        field: "status",
        hide: !showStatusColumn, // 👈 KEY FIX
        editable: !showAsterisk,
        filter: true,
        sortable: false,

        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: statusdrop.map((opt) => opt.attributedetails_name),
        },

        singleClickEdit: true,

        valueFormatter: (params) => {
          const selected = filteredOptionStatus.find(
            (item) => item.value === params.value,
          );

          return selected ? selected.label : params.value;
        },
      },
    ],
    [partyDrop, showAsterisk, isExistingData, statusdrop, showStatusColumn],
  );

  const defaultColDef = {
    resizable: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  // const handleCellValueChanged = (params) => {
  //   const { colDef, rowIndex, newValue } = params;

  //   // Prevent auto row add for existing fetched records
  //   if (isExistingData) return;

  //   const lastRowIndex = rowData.length - 1;

  //   if (colDef.field === "opening_amount") {
  //     const amount = parseFloat(newValue);

  //     // Prevent invalid numbers
  //     if (isNaN(amount)) return;

  //     // Add new row only for last row
  //     if (amount > 0 && rowIndex === lastRowIndex) {
  //       const serialNumber = rowData.length + 1;

  //       const newRowData = {
  //         serialNumber,
  //         TransactionNo: "",
  //         entry_date: getFinancialYearDate(),
  //         party_type: "",
  //         party_code: "",
  //         itemName: "",
  //         balance_type: "",
  //         opening_amount: "",
  //         remarks: "",
  //       };

  //       setRowData((prevRowData) => [...prevRowData, newRowData]);
  //     }
  //   }
  // };

  const handleCellValueChanged = (params) => {
    const { colDef, newValue } = params;

    if (colDef.field === "opening_amount") {
      const amount = parseFloat(newValue);

      // prevent invalid number issue
      if (isNaN(amount)) {
        params.node.setDataValue("opening_amount", "");
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const opening_balanceData = rowData
        .filter(
          (row) =>
            row.party_code &&
            row.party_type &&
            row.opening_amount &&
            row.balance_type,
        )
        .map((row) => ({
          transaction_no: "",
          financial_year: getFinancialYear(),
          entry_date: row.entry_date,
          party_type: row.party_type,
          party_code: row.party_code,
          keyfield: "",
          opening_amount: parseFloat(row.opening_amount),
          balance_type: row.balance_type,
          remarks: row.remarks || "",
          status: "Active",
          data_deleted: false,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          created_by: sessionStorage.getItem("selectedUserCode"),
          Location_Code: sessionStorage.getItem("selectedLocationCode"),
          created_date: new Date(),
          modified_by: "",
          modified_date: null,
        }));

      console.log("Payload :", opening_balanceData);

      if (opening_balanceData.length === 0) {
        toast.warning("Please enter grid data");
        return;
      }

      const response = await fetch(
        `${config.apiBaseUrl}/opening_balanceLoopInsert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opening_balanceData,
          }),
        },
      );

      const data = await response.json();

      console.log("Response :", data);

      if (response.ok) {
        toast.success("Data Inserted Successfully");

        // set generated transaction no
        settransaction_no(data.transaction_no);

        // update grid transaction no
        const updatedRows = rowData.map((row) => ({
          ...row,
          TransactionNo: data.transaction_no,
        }));

        setRowData(updatedRows);
      } else {
        toast.error(data.message || "Insert Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while saving");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGetOpeningBalance(transaction_no);
    }
  };

  const handleGetOpeningBalance = async (code) => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiBaseUrl}/get_GOB`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: code,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      const data = await response.json();

      console.log("FETCHED DATA :", data);

      if (response.ok) {
        // grid data set
        const formattedData = [
          {
            serialNumber: 1,
            TransactionNo: data.transaction_no,
            entry_date: formatDate(data.entry_date),
            party_type: data.party_type,
            party_code: data.party_code,
            itemName: data.party_code,
            balance_type: data.balance_type,
            opening_amount: data.opening_amount,
            remarks: data.remarks,
            financial_year: data.financial_year,
            keyfield: data.keyfield,
            status: data.status,
          },
        ];

        setRowData(formattedData);

        // header values
        settransaction_no(data.transaction_no);
        settransaction_date(formatDate(data.entry_date));

        setIsExistingData(true);
        setShowStatusColumn(true);
      } else if (response.status === 404) {
        toast.warning("Data not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;

    const newRow = {
      serialNumber,
      TransactionNo: "",
      entry_date: getFinancialYearDate(),
      party_type: "",
      party_code: "",
      itemName: "",
      balance_type: "",
      opening_amount: "",
      remarks: "",
      financial_year: getFinancialYear(),
      keyfield: "",
      status: "Active",
    };

    setRowData((prev) => [...prev, newRow]);
  };
  const handleRemoveRow = () => {
    // fetched data rows delete prevent
    if (isExistingData) {
      toast.warning("Fetched data rows cannot be removed");
      return;
    }

    if (rowData.length === 1) {
      setRowData([
        {
          serialNumber: 1,
          TransactionNo: "",
          entry_date: getFinancialYearDate(),
          party_type: "",
          party_code: "",
          itemName: "",
          balance_type: "",
          opening_amount: "",
          remarks: "",
          financial_year: getFinancialYear(),
          keyfield: "",
          status: "Active",
        },
      ]);

      return;
    }

    const updatedRowData = rowData.slice(0, -1);

    setRowData(updatedRowData);
  };

  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [global, setGlobal] = useState(null);
  const [globalItem, setGlobalItem] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);
    setOpen4(false);
  };

  const handleOpeningBalance = () => {
    setOpen(true);
  };

  const handleOb = (selectedData) => {
    const formattedData = selectedData.map((item, index) => ({
      serialNumber: index + 1,

      TransactionNo: item.transaction_no,
      entry_date: item.entry_date,
      party_type: item.party_type,
      party_code: item.party_code,
      opening_amount: item.opening_amount,
      balance_type: item.balance_type,
      remarks: item.remarks,
      keyfield: item.keyfield,
      status: item.status,
    }));

    setRowData(formattedData);
  };

  const handleOI = (selectedData) => {
    setIsExistingData(true);

    if (selectedData && selectedData.length > 0) {
      // SHOW TRANSACTION COLUMN
       setShowTransactionColumn(true);
      const formattedData = selectedData.map((item, index) => ({
        serialNumber: index + 1,

        TransactionNo: item.transaction_no,
        entry_date: item.entry_date,
        party_type: item.party_type,
        party_code: item.party_code,
        itemName: item.party_code, // keep same behavior
        balance_type: item.balance_type,
        opening_amount: item.opening_amount,
        financial_year: item.financial_year,
        keyfield: item.keyfield,
        remarks: item.remarks,
        status: item.status,
      }));

      settransaction_no(selectedData[0].transaction_no);
      setRowData(formattedData);
      setShowStatusColumn(true);
    }
  };

  const handleReload = () => {
    setIsExistingData(false);
    setShowTransactionColumn(false);
    window.location.reload();
  };

  const handleChangeParty = (selectedParty) => {
    setSelectedParty(selectedParty);
    const selectedValue = selectedParty ? selectedParty.value : "";

    setParty(selectedValue);

    // if (selectedValue === "Customer") {
    //   const shipToField = headerRowData.find((row) => row.fieldName === "Vendor / Customer Code");
    //   if (shipToField?.shipTo) {
    //     handleCustomerDetailsShipTo(shipToField.shipTo);
    //   }
    // } else if (selectedValue === "Vendor") {
    //   const shipToField = headerRowData.find((row) => row.fieldName === "Vendor / Customer Code");
    //   if (shipToField?.shipTo) {
    //     handleVendorDetailsShipTo(shipToField.shipTo);
    //   }
    // }
  };

  const handleCustomerSelect = (selectedData) => {
  const updatedRowData = [...rowData];

  if (selectedData && selectedData.length > 0) {
    const customer = selectedData[0];

    // =========================================
    // CHECK OB DATA EXISTS
    // =========================================

    const hasOBData =
      customer.OB_transaction_no &&
      customer.OB_opening_amount &&
      customer.OB_keyfield;

    updatedRowData[global - 1] = {
      ...updatedRowData[global - 1],

      // =================================
      // NORMAL CUSTOMER VALUES
      // =================================

      party_type: "Customer",

      party_code: customer.CustomerCode,

      itemName: customer.CustomerName,

      // =================================
      // OB VALUES (ONLY IF EXISTS)
      // =================================

      TransactionNo: hasOBData
        ? customer.OB_transaction_no || ""
        : "",

      entry_date: hasOBData
        ? customer.OB_entry_date || ""
        : getFinancialYearDate(),

      financial_year: hasOBData
        ? customer.OB_financial_year || ""
        : "",

      keyfield: hasOBData
        ? customer.OB_keyfield || ""
        : "",

      balance_type: hasOBData
        ? customer.OB_balance_type || ""
        : "",

      opening_amount: hasOBData
        ? customer.OB_opening_amount || ""
        : "",

      remarks: hasOBData
        ? customer.OB_remarks || ""
        : "",

      status: hasOBData
        ? customer.OB_status || "Active"
        : "Active",
    };

    // =========================================
    // SHOW ACTION COLUMN ONLY IF OB EXISTS
    // =========================================

    if (hasOBData) {
      setIsExistingData(true);
      setShowStatusColumn(true);
      setShowTransactionColumn(true);

      settransaction_no(customer.OB_transaction_no);
    } else {
      setIsExistingData(false);
      setShowStatusColumn(false);
      setShowTransactionColumn(false);

      settransaction_no("");
    }
  }

  setRowData(updatedRowData);

  setOpen2(false);
};

const handlePartyCodeFetch = async (params) => {
  try {
    const row = params.data;

    if (!row.party_type || !row.party_code) {
      return;
    }

    let apiUrl = "";
    let payload = {};

    // =========================================
    // CUSTOMER
    // =========================================

    if (row.party_type === "Customer") {
      apiUrl = `${config.apiBaseUrl}/getCustomerSearchdata`;

      payload = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        customer_code: row.party_code,
      };
    }

    // =========================================
    // VENDOR
    // =========================================

    else if (row.party_type === "Vendor") {
      apiUrl = `${config.apiBaseUrl}/vendorsearchdata`;

      payload = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        vendor_code: row.party_code,
      };
    }

    else {
      return;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.length) {
      toast.warning("Party not found");
      return;
    }

    const result = data[0];

    // =========================================
    // COMMON VALUES
    // =========================================

    const partyCode =
      row.party_type === "Customer"
        ? result.customer_code
        : result.vendor_code;

    const partyName =
      row.party_type === "Customer"
        ? result.customer_name
        : result.vendor_name;

    // =========================================
    // CHECK OB EXISTS
    // =========================================

    const hasOBData =
      result.OB_transaction_no &&
      result.OB_opening_amount &&
      result.OB_keyfield;

    const updatedRows = [...rowData];

    updatedRows[params.node.rowIndex] = {
      ...updatedRows[params.node.rowIndex],

      party_code: partyCode,

      itemName: partyName,

      // =====================================
      // OB VALUES
      // =====================================

      TransactionNo: hasOBData
        ? result.OB_transaction_no || ""
        : "",

      entry_date: hasOBData
        ? result.OB_entry_date || ""
        : getFinancialYearDate(),

      financial_year: hasOBData
        ? result.OB_financial_year || ""
        : "",

      keyfield: hasOBData
        ? result.OB_keyfield || ""
        : "",

      balance_type: hasOBData
        ? result.OB_balance_type || ""
        : "",

      opening_amount: hasOBData
        ? result.OB_opening_amount || ""
        : "",

      remarks: hasOBData
        ? result.OB_remarks || ""
        : "",

      status: hasOBData
        ? result.OB_status || "Active"
        : "Active",
    };

    // =========================================
    // EXISTING OB
    // =========================================

    if (hasOBData) {
      setIsExistingData(true);
      setShowTransactionColumn(true);
      setShowStatusColumn(true);

      settransaction_no(result.OB_transaction_no);
    }

    // =========================================
    // NORMAL ENTRY
    // =========================================

    else {
      setIsExistingData(false);
      setShowTransactionColumn(false);
      setShowStatusColumn(false);
    }

    setRowData(updatedRows);
  } catch (error) {
    console.error(error);

    toast.error("Error fetching party data");
  }
};

const handleVendorSelect = (selectedData) => {
  if (!selectedData || selectedData.length === 0) {
    setOpen4(false);
    return;
  }

  const vendor = selectedData[0];

  // =========================================
  // CHECK OB DATA EXISTS
  // =========================================

  const hasOBData =
    vendor.OB_transaction_no &&
    vendor.OB_opening_amount !== null &&
    vendor.OB_opening_amount !== undefined &&
    vendor.OB_keyfield;

  // =========================================
  // IF OB DATA EXISTS
  // SAME LIKE handleOI()
  // =========================================

  if (hasOBData) {
    setIsExistingData(true);
    setShowStatusColumn(true);
    setShowTransactionColumn(true);

    const formattedData = [
      {
        serialNumber: 1,

        TransactionNo: vendor.OB_transaction_no,

        entry_date: vendor.OB_entry_date,

        party_type: "Vendor",

        party_code: vendor.VendorCode,

        itemName: vendor.VendorName,

        balance_type: vendor.OB_balance_type,

        opening_amount: vendor.OB_opening_amount,

        financial_year: vendor.OB_financial_year,

        keyfield: vendor.OB_keyfield,

        remarks: vendor.OB_remarks,

        status: vendor.OB_status || "Active",
      },
    ];

    settransaction_no(vendor.OB_transaction_no);

    setRowData(formattedData);
  }

  // =========================================
  // NORMAL VENDOR SELECT
  // =========================================

  else {
    setIsExistingData(false);
    setShowStatusColumn(false);
    setShowTransactionColumn(false);

    const updatedRowData = [...rowData];

    updatedRowData[global - 1] = {
      ...updatedRowData[global - 1],

      party_type: "Vendor",

      party_code: vendor.VendorCode,

      itemName: vendor.VendorName,

      // CLEAR OLD OB VALUES
      TransactionNo: "",
      balance_type: "",
      opening_amount: "",
      financial_year: "",
      keyfield: "",
      remarks: "",
      status: "Active",
    };

    settransaction_no("");

    setRowData(updatedRowData);
  }

  setOpen4(false);
};
  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer
        position="top-right"
        className="toast-design"
        theme="colored"
      />
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div className=" d-flex justify-content-between">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut me-5">
                Opening Balance
              </h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {saveButtonVisible &&
                ["add", "all permission"].some((permission) =>
                  openingItemPermission.includes(permission),
                ) && (
                  <savebutton
                    className="purbut"
                    title="Save"
                    onClick={handleSave}
                  >
                    <i class="fa-regular fa-floppy-disk"></i>
                  </savebutton>
                )}
              <printbutton
                className="purbut"
                title="Reload"
                onClick={handleReload}
              >
                <i class="fa-solid fa-arrow-rotate-right"></i>
              </printbutton>
            </div>
            <div class="mobileview">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="h1">
                    Opening Item
                  </h1>
                </div>
                <div class="dropdown mt-2 me-4">
                  <button
                    class="btn btn-primary dropdown-toggle p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu">
                    {saveButtonVisible && (
                      <li class="iconbutton d-flex justify-content-center text-success">
                        {["add", "all permission"].some((permission) =>
                          openingItemPermission.includes(permission),
                        ) && (
                          <icon class="icon" onClick={handleSave}>
                            <i class="fa-regular fa-floppy-disk"></i>
                          </icon>
                        )}
                      </li>
                    )}
                    <li class="iconbutton  d-flex justify-content-center">
                      <icon class="icon" onClick={handleReload}>
                        <i class="fa-solid fa-arrow-rotate-right"></i>
                      </icon>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="shadow-lg p-1 bg-body-tertiary rounded  pt-4 "
          align="left"
        >
          <div className="row ms-3 mb-3 me-3">
            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
                <label
                  for="rolname"
                  className={`${deleteError && !transaction_no ? "red" : ""}`}
                >
                  Transaction No{" "}
                  {showAsterisk && <span className="text-danger">*</span>}
                </label>
                <div class="d-flex justify-content-end">
                  <input
                    id="transactionNO"
                    className="exp-input-field form-control justify-content-start"
                    type="text"
                    placeholder=""
                    required
                    title="Please fill the transaction no here"
                    value={transaction_no}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                    onChange={(e) => settransaction_no(e.target.value)}
                  />
                  <div className="position-absolute mt-1 me-2">
                    <span
                      className="icon searchIcon"
                      title="Opening Item Help"
                      onClick={handleOpeningBalance}
                    >
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
                <label
                  for="rolname"
                  className={`${error && !transaction_date ? "red" : ""}`}
                >
                  Transaction Date
                  {!showAsterisk && <span className="text-danger">*</span>}
                </label>
                <input
                  id="transactionDate"
                  className="exp-input-field form-control"
                  type="date"
                  value={transaction_date}
                  onChange={(e) => settransaction_date(e.target.value)}
                  readOnly
                  title="Transaction date is fixed and based on the financial year."
                />
              </div>
            </div>
          </div>
          {!isExistingData && (
            <div
              className="d-flex justify-content-end mb-2"
              style={{ marginRight: "50px" }}
            >
              <icon
                type="button"
                className="popups-btn"
                title="Add row"
                onClick={handleAddRow}
              >
                <FontAwesomeIcon icon={faPlus} />
              </icon>

              <icon
                type="button"
                className="popups-btn"
                title="Less row"
                onClick={handleRemoveRow}
              >
                <FontAwesomeIcon icon={faMinus} />
              </icon>
            </div>
          )}
          <div class="ag-theme-alpine" style={{ height: 545, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              onCellValueChanged={handleCellValueChanged}
              paginationAutoPageSize={true}
              pagination={true}
              rowSelection="multiple"
              onCellKeyDown={(params) => {
              if (
                params.event.key === "Enter" &&
                params.colDef.field === "party_code"
              ) {
                handlePartyCodeFetch(params);
              }
            }}
            />
          </div>
          <div>
            <PoCustomerPopup
              open={open2}
              handleClose={handleClose}
              handleVendor={handleCustomerSelect}
            />
            <PoVendorPopup
              open={open4}
              handleClose={handleClose}
              handleVendor={handleVendorSelect}
            />
            <ObPopup
              open={open}
              handleClose={handleClose}
              handleOb={handleOI}
            />
          </div>
        </div>
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">Created_by: {additionalData.created_by}</p>
            <p className="col-md-">
              Created_date: {additionalData.created_date}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              modified_by: {additionalData.modified_by}
            </p>
            <p className="col-md-6">
              modified_date: {additionalData.modified_date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Openingbalance;
