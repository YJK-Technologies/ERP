import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import LoadingScreen from './Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
const config = require('./Apiconfig');

const SettingsPage = () => {
    const [item, setItem] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [itemDrop, setItemDrop] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const Location_Code = sessionStorage.getItem("selectedLocationCode");
    const created_by = sessionStorage.getItem("selectedUserCode");

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");

        fetch(`${config.apiBaseUrl}/getboolean`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((val) => { setItemDrop(val) })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const filteredOptionItem = Array.isArray(itemDrop)
        ? itemDrop.map((option) => ({
            value: option.attributedetails_name,
            label: option.attributedetails_name,
        }))
        : [];

    const handleChangeItem = (selectedItem) => {
        setSelectedItem(selectedItem);
        setItem(selectedItem ? selectedItem.value : "");
    };

    const getItemSettings = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${config.apiBaseUrl}/getItemSettings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        company_code,
                        Location_Code
                    }),
                }
            );

            const data = await response.json();

            if (data.length > 0) {
                const barcodeValue = data[0].Generate_Barcode_From_ItemCode;

                const selectedOption = filteredOptionItem.find(
                    option => option.value.toLowerCase() === barcodeValue.toLowerCase()
                );

                setSelectedItem(selectedOption || null);
                setItem(barcodeValue);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getItemSettings();
    }, [itemDrop]);

    const saveItemSettings = async () => {
        try {

            if (!item) {
                toast.warning("Barcode Setting is required");
                setError(true);
                return;
            }

            setError(false);
            setLoading(true);

            const response = await fetch(`${config.apiBaseUrl}/itemSettingsInsert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        company_code,
                        Location_Code,
                        Generate_Barcode_From_ItemCode: item,
                        created_by,
                    }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                toast.success(result[0]?.Message || "Saved Successfully");
            } else {
                toast.warning(result.message);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = () => {
        navigate("/Item");
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-0 bg-body-tertiary rounded ">
                <div className=" mb-0 d-flex justify-content-between">
                    <h1 align="left" class="purbut">
                        Item Settings
                    </h1>
                    <h1 align="left" class="mobileview fs-4">
                        Item Settings
                    </h1>

                    <button
                        onClick={handleNavigate}
                        className=" btn btn-danger shadow-none rounded-0 h-70 fs-5"
                        required
                        title="Close"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div class="pt-2 mb-4">
                <div className="shadow-lg p-3 bg-body-tertiary rounded  mb-2">
                    <div class="row">

                        <div className="col-md-3 form-group">
                            <div class="exp-form-floating">
                                <label for="Iourbrand" className={`exp-form-labels ${error && !item ? "text-danger" : ""}`}>
                                    Use Item Code as Barcode<span className="text-danger">*</span>
                                </label>
                                <div title="Select the Own Brand">
                                    <Select
                                        id="ahsts"
                                        isClearable
                                        value={selectedItem}
                                        onChange={handleChangeItem}
                                        options={filteredOptionItem}
                                        className="exp-input-field"
                                        placeholder=""
                                        maxLength={30}
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3 form-group">
                            <div class="d-flex justify-content-start ">
                                <button
                                    onClick={saveItemSettings}
                                    className="mt-4"
                                    title="Save"
                                >
                                    <i class="fa-solid fa-floppy-disk"></i>
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
