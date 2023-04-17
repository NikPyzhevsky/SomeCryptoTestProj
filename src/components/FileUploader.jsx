import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import xml2js, { parseString } from 'xml2js';
import {addIntermediatePoints, changeGPX, transformGPXFile} from "../Utils";

const FileUploader = () => {
    const [file, setFile] = useState(null);
    const [gpxXML,setGpxXML] = useState(null)

    const onDrop = async (acceptedFiles) => {
        const reader = new FileReader();
        reader.readAsText(acceptedFiles[0]);
        // const result = changeGPX(reader.result)

        reader.onload = async () => {
            parseString(reader.result, async (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    // console.log(result)
                    const transformedObj = transformGPXFile(result);
                    const updatedGPXOBJ = addIntermediatePoints(transformedObj)
                    var builder = new xml2js.Builder();
                    var xml = builder.buildObject(updatedGPXOBJ);

                    setGpxXML(xml.toString())

                    // тут можно сохранить новый файл
                }
            });
        };
        setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {file ? (
                <p>Файл выбран: {file.name}</p>
            ) : (
                <p>Перетащите сюда файл или кликните для выбора</p>
            )}
            {gpxXML&&gpxXML}
        </div>
    );
};

export default FileUploader;
