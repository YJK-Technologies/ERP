import { useState } from "react";
import * as React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import "ag-grid-autocomplete-editor/dist/main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
const config = require("./Apiconfig");

const columnDefs = [
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    headerName: "Transaction No",
    field: "transaction_no",
    cellStyle: { textAlign: "center" },
    minWidth: 200,
    editable: false,
  },
  {
    headerName: "Financial Year",
    field: "financial_year",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 150,
  },
  {
    headerName: "Entry Date",
    field: "entry_date",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 150,
  },
  {
    headerName: "Party Type",
    field: "party_type",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 150,
  },
  {
    headerName: "Party Code",
    field: "party_code",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 150,
  },
  {
    headerName: "Opening Amount",
    field: "opening_amount",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 150,
  },
  {
    headerName: "Balance Type",
    field: "balance_type",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 150,
  },
  {
    headerName: "Status",
    field: "status",
    editable: false,
    cellStyle: { textAlign: "center" },
    minWidth: 120,
  },
  {
    headerName: "keyfield",
    field: "keyfield",
    editable: false,
    hide: true,
    cellStyle: { textAlign: "center" },
    minWidth: 120,
  },
];

const defaultColDef = {
  resizable: true,
  wrapText: false,
  sortable: true,
  editable: true,
  flex: 1,
};

export default function ObPopup({ open, handleClose, handleOb }) {
  const [rowData, setRowData] = useState([]);
  const [transaction_no, settransaction_no] = useState("");
  const [transaction_date, settransaction_date] = useState("");
  const [acc_type, setacc_type] = useState("");
  const [acct_code, setacct_code] = useState("");
  const [journal_no, setjournal_no] = useState("");
  const [financial_year, setfinancial_year] = useState("");
  const [entry_date, setentry_date] = useState("");
  const [party_type, setparty_type] = useState("");
  const [party_code, setparty_code] = useState("");

  const handleSearchItem = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/OpeningBalanceSC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          Location_Code: sessionStorage.getItem("selectedLocationCode"),
          transaction_no,
          financial_year,
          entry_date,
          party_type,
          party_code,
        }),
      });

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully");
      } else if (response.status === 404) {
        toast.error("Data Not Found");

        setRowData([]);
        clearInputs();
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleReload = () => {
    clearInputs([]);
    setRowData([]);
  };

  const clearInputs = () => {
    settransaction_no("");
    setfinancial_year("");
    setentry_date("");
    setparty_type("");
    setparty_code("");
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

const handleConfirm = () => {
  const selectedData = selectedRows.map((row) => ({
    transaction_no: row.transaction_no,
    financial_year: row.financial_year,
    entry_date: row.entry_date,
    party_type: row.party_type,
    party_code: row.party_code,
    opening_amount: row.opening_amount,
    balance_type: row.balance_type,
    remarks: row.remarks,
    status: row.status,
    keyfield: row.keyfield,
    company_code: row.company_code,
  }));

  handleOb(selectedData);
  handleClose();
  clearInputs();
  setRowData([]);
  setSelectedRows([]);
};
  return (
    <div>
      {open && (
        <fieldset>
          <div>
            <div className="purbut">
              <div
                className="modal mt-5 Topnav-screen popup popupadj"
                tabIndex="-1"
                role="dialog"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div
                  className="modal-dialog modal-xl ps-5 p-1 pe-5"
                  role="document"
                >
                  <div className="modal-content">
                    <div class="row justify-content-center">
                      <div class="col-md-12 text-center">
                        <div className="p-0 bg-body-tertiary">
                          <div className="purbut mb-0 d-flex justify-content-between">
                            <h1 align="left" className="purbut">
                              Opening Balance Help
                            </h1>
                            <button
                              onClick={handleClose}
                              className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5"
                              required
                              title="Close"
                            >
                              <i class="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                          <div class="d-flex justify-content-between">
                            <div className="d-flex justify-content-start"></div>
                          </div>
                        </div>
                      </div>
                      <div className="modal-body">
                        <div className="row ms-3 me-3">
                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              className="exp-input-field form-control"
                              placeholder="Transaction No"
                              value={transaction_no}
                              onChange={(e) =>
                                settransaction_no(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>

                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              className="exp-input-field form-control"
                              placeholder="Financial Year"
                              value={financial_year}
                              onChange={(e) =>
                                setfinancial_year(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>

                          <div className="col-sm mb-2">
                            <input
                              type="date"
                              className="exp-input-field form-control"
                              value={entry_date}
                              onChange={(e) => setentry_date(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>

                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              className="exp-input-field form-control"
                              placeholder="Party Type"
                              value={party_type}
                              onChange={(e) => setparty_type(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>

                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              className="exp-input-field form-control"
                              placeholder="Party Code"
                              value={party_code}
                              onChange={(e) => setparty_code(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>
                          <div className="mb-2 mt-2 d-flex justify-content-end">
                            <icon
                              className="icon popups-btn"
                              onClick={handleSearchItem}
                            >
                              <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </icon>
                            <icon
                              className="icon popups-btn"
                              onClick={handleReload}
                            >
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </icon>
                            <icon
                              className="icon popups-btn"
                              onClick={handleConfirm}
                            >
                              <FontAwesomeIcon icon="fa-solid fa-check" />
                            </icon>
                          </div>
                        </div>
                        <div
                          className="ag-theme-alpine"
                          style={{ height: "400px", width: "100%" }}
                        >
                          <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection="multiple"
                            pagination
                            onSelectionChanged={handleRowSelected}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mobileview">
              <div
                className="modal mt-5 Topnav-screen"
                tabIndex="-1"
                role="dialog"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div
                  className="modal-dialog modal-xl ps-4 pe-4 p-1"
                  role="document"
                >
                  <div className="modal-content">
                    <div class="row justify-content-center">
                      <div class="col-md-12 text-center">
                        <div className="mb-0 d-flex justify-content-between">
                          <div className="mb-0 d-flex justify-content-start me-4">
                            <h1 className="h1">OB Help</h1>
                          </div>
                          <div className="mb-0 d-flex justify-content-end">
                            <button
                              onClick={handleClose}
                              className="closebtn2"
                              required
                              title="Close"
                            >
                              <i class="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                        <div class="d-flex justify-content-between">
                          <div className="d-flex justify-content-start"></div>
                        </div>
                      </div>
                      <div className="modal-body">
                        <div className="row ms-3 me-3">
                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              id="ItemCode"
                              className="exp-input-field form-control"
                              placeholder="Transaction No"
                              value={transaction_no}
                              onChange={(e) =>
                                settransaction_no(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              id="Variant"
                              className="exp-input-field form-control"
                              placeholder="Transaction Date"
                              value={transaction_date}
                              onChange={(e) =>
                                settransaction_date(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              id="ShortName"
                              className="exp-input-field form-control"
                              placeholder="Account Type"
                              value={acc_type}
                              onChange={(e) => setacc_type(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              id="OurBrand"
                              className="exp-input-field form-control"
                              placeholder="Account Code"
                              value={acct_code}
                              onChange={(e) => setacct_code(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-sm mb-2">
                            <input
                              type="text"
                              id="Status"
                              className="exp-input-field form-control"
                              placeholder="Journal No"
                              value={journal_no}
                              onChange={(e) => setjournal_no(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSearchItem()
                              }
                              autoComplete="off"
                            />
                          </div>
                          <div className="mb-2 mt-2 d-flex justify-content-end">
                            <button className="" onClick={handleSearchItem}>
                              <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>
                            <button className="" onClick={handleReload}>
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </button>
                            <button className="" onClick={handleConfirm}>
                              <FontAwesomeIcon icon="fa-solid fa-check" />
                            </button>
                          </div>
                          <div
                            className="ag-theme-alpine"
                            style={{ height: "400px", width: "100%" }}
                          >
                            <AgGridReact
                              rowData={rowData}
                              columnDefs={columnDefs}
                              defaultColDef={defaultColDef}
                              rowSelection="multiple"
                              pagination
                              onSelectionChanged={handleRowSelected}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
}
