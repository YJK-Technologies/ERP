import { useState, useEffect } from "react";
import "./apps.css";
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const config = require('./Apiconfig');

function PrintTemplate() {
    const [itemCodeDrop, setItemCodeDrop] = useState([]);
    const [uomdrop, setuomdrop] = useState([]);
    const [suomdrop, setsuomdrop] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [itemCode, setItemCode] = useState('');
    const [itemName, setItemName] = useState('');
    const [selectedUom, setSelectedUom] = useState('');
    const [selectedSuom, setSelectedSuom] = useState('');
    const [Item_BaseUOM, setItem_BaseUOM] = useState("");
    const [Item_SecondaryUOM, setItem_SecondaryUOM] = useState("");
    const [UomQty, setUomQty] = useState("");
    const [SuomQty, setSuomQty] = useState("");

    useEffect(() => {
        const fetchItemCode = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/getSalesItemCode`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        company_code: sessionStorage.getItem("selectedCompanyCode"),
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setItemCodeDrop(data);
                } else {
                    console.warn("No data found for item codes");
                    setItemCodeDrop([]);
                }
            } catch (error) {
                console.error("Error fetching item codes:", error);
            }
        };

        fetchItemCode();
    }, []);

    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        fetch(`${config.apiBaseUrl}/uom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
        })
            .then((data) => data.json())
            .then((val) => setuomdrop(val))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);


    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        fetch(`${config.apiBaseUrl}/getSecondaryuom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
        })
            .then((data) => data.json())
            .then((val) => setsuomdrop(val))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const filteredOptionItem = itemCodeDrop.map((option) => ({
        value: option.Item_code,
        label: `${option.Item_code} - ${option.Item_name}`,
    }));

    const filteredOptionuom = uomdrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filteredOptionSuom = suomdrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangeItem = async (selectedItem) => {
        setSelectedItem(selectedItem);
        setItemCode(selectedItem ? selectedItem.value : '')
        setItemName(selectedItem ? selectedItem.label : '')
    };

    const handleChangeUom = (selectedUom) => {
        setSelectedUom(selectedUom);
        setItem_BaseUOM(selectedUom ? selectedUom.value : '');

    };

    const handleChangeSuom = (selectedSuom) => {
        setSelectedSuom(selectedSuom);
        setItem_SecondaryUOM(selectedSuom ? selectedSuom.value : '');
    };

    const handleSave = async () => {

        try {
            const response = await fetch(`${config.apiBaseUrl}/UOMConverterInsert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Item_code : itemCode,
                    Uom : Item_BaseUOM,
                    UomQty : UomQty,
                    Suom : Item_SecondaryUOM,
                    SuomQty : SuomQty,
                    company_code : sessionStorage.getItem('selectedCompanyCode'),
                    created_by : sessionStorage.getItem('selectedUserCode')
                }),
            });
            if (response.ok) {
                setTimeout(() => {
                    toast.success("Data saved successfully!", {
                        onClose: () => window.location.reload(),
                    });
                }, 1000);
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.warning(errorResponse.message)
            }
        } catch (err) {
            console.error("Error delete data:", err);
            toast.error('Error delete data: ' + err.message);
        }
    };

    return (
        <div className="container-fluid Topnav-screen">
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-1 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center">

                    <h1 className="">Item UOM Convertor</h1>

                    <div
                        className="btn btn-light border shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: "45px", height: "45px", cursor: "pointer" }}
                        onClick={handleSave}
                    >
                        <i className="fa-solid fa-floppy-disk"></i>
                    </div>

                </div>
            </div>

            <div className="shadow-lg bg-light rounded mt-2 p-3">
                <div class="row">
                    <div className="col-md-2">
                        <label className=''>Item Code</label>
                        <Select
                            id="salesMode"
                            className="exp-input-field"
                            placeholder=""
                            required
                            isClearable
                            value={selectedItem}
                            onChange={handleChangeItem}
                            options={filteredOptionItem}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className=''>Item Name</label>
                        <div class="exp-form-floating">
                            <div class="d-flex justify-content-end">
                                <input
                                    id="employeeId"
                                    className="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    required
                                    value={itemName}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2">
                        <label className=''>Base UOM</label>
                        <div class="exp-form-floating">
                            <div class="d-flex justify-content-end">
                                <Select
                                    id="BUOM"
                                    value={selectedUom}
                                    onChange={handleChangeUom}
                                    options={filteredOptionuom}
                                    className="exp-input-field"
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2">
                        <label className=''>Base UOM Qty</label>
                        <div class="exp-form-floating">
                            <div class="d-flex justify-content-end">
                                <input
                                    id="employeeId"
                                    className="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    required
                                    value={UomQty}
                                    onChange={(e) => setUomQty(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2">
                        <label className=''>Secondary UOM</label>
                        <div class="exp-form-floating">
                            <div class="d-flex justify-content-end">
                                <Select
                                    id="SUOM"
                                    value={selectedSuom}
                                    onChange={handleChangeSuom}
                                    options={filteredOptionSuom}
                                    className="exp-input-field"
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2">
                        <label className=''>Secondary UOM Qty</label>
                        <div class="exp-form-floating">
                            <div class="d-flex justify-content-end">
                                <input
                                    id="employeeId"
                                    className="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    required
                                    value={SuomQty}
                                    onChange={(e) => setSuomQty(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default PrintTemplate;