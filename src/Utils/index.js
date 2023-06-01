export const changeGPX = (xml) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

// Получение списка всех trkpt элементов
    const trkpts = xmlDoc.getElementsByTagName("trkpt");

// Создание нового XML документа
    const newXmlDoc = document.implementation.createDocument(null, "gpx", null);

// Добавление нового trk элемента в новый документ
    const newTrk = newXmlDoc.createElement("trk");
    newXmlDoc.documentElement.appendChild(newTrk);

// Добавление нового trkseg элемента в новый документ
    const newTrkseg = newXmlDoc.createElement("trkseg");
    newTrk.appendChild(newTrkseg);

// Преобразование и добавление каждого trkpt элемента в новый документ
    for (let i = 0; i < trkpts.length; i++) {
        const trkpt = trkpts[i];

        // Получение атрибутов lat и lon
        const lat = trkpt.getAttribute("lat");
        const lon = trkpt.getAttribute("lon");

        // Получение содержимого name элемента
        const name = trkpt.getElementsByTagName("name")[0].textContent;

        // Создание нового wpt элемента и добавление его в новый trkseg элемент
        const newWpt = newXmlDoc.createElement("wpt");
        newWpt.setAttribute("lat", lat);
        newWpt.setAttribute("lon", lon);
        newTrkseg.appendChild(newWpt);

        // Добавление нового name элемента в новый wpt элемент
        const newName = newXmlDoc.createElement("name");
        newName.textContent = name;
        newWpt.appendChild(newName);

        // Добавление нового time элемента в новый wpt элемент
        const newTime = newXmlDoc.createElement("time");
        newTime.textContent = new Date().toISOString();
        newWpt.appendChild(newTime);
    }

// Преобразование нового XML документа в строку
    const serializer = new XMLSerializer();
    return  serializer.serializeToString(newXmlDoc);
}

export function transformGPXFile(gpxFile) {
    console.log(gpxFile)
    const trkpts = gpxFile.gpx.trk[0].trkseg[0].trkpt;
    const newWpts = [];
    const startingDate = new Date(2019, 11, 6, 14, 20, 50); // December 6th, 2019 at 2:19:00 PM


    // Преобразование каждого trkpt элемента в новый wpt элемент
    for (let i = 0; i < trkpts.length; i++) {
        const trkpt = trkpts[i];

        // Получение атрибутов lat и lon
        const lat = trkpt.$.lat;
        const lon = trkpt.$.lon;

        // Получение содержимого name элемента
        const name = `Point ${i}`

        // Создание нового wpt элемента
        const newWpt = {
            $: {
                lat: lat,
                lon: lon,
            },
            name: [name],
        };

        // Добавление нового time элемента в новый wpt элемент
        newWpt.time = [{ _: new Date(startingDate.getTime() + i * 3000).toISOString(), $: {} }];

        // Добавление нового wpt элемента в новый массив
        newWpts.push(newWpt);
    }

    // Создание нового gpx объекта
    const newGpx = {
        gpx: {
            $: {
                xmlns: "http://www.topografix.com/GPX/1/1",
                "xmlns:gpxx": "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
                "xmlns:gpxtpx": "http://www.garmin.com/xmlschemas/TrackPointExtension/v1",
                creator: "mapstogpx.com",
                version: "1.1",
            },
            wpt: newWpts,
        },
    };

    return newGpx;
}

export function addIntermediatePoints(gpx) {
    const earthRadius = 6371000; // Earth radius in meters
    const trkpts = gpx.gpx.wpt;
    const newWpts = [];

    for (let i = 0; i < trkpts.length - 1; i++) {
        const trkpt1 = trkpts[i];
        const trkpt2 = trkpts[i + 1];
        const lat1 = parseFloat(trkpt1.$.lat);
        const lon1 = parseFloat(trkpt1.$.lon);
        const lat2 = parseFloat(trkpt2.$.lat);
        const lon2 = parseFloat(trkpt2.$.lon);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;

        if (distance > 10) {
            const numPoints = Math.ceil(distance / 10);
            const timeDiff = new Date(trkpt2.time[0]['_']) - new Date(trkpt1.time[0]['_']);
            const timeStep = timeDiff / numPoints;

            for (let j = 1; j < numPoints; j++) {
                const frac = j / numPoints;
                const lat = lat1 + frac * (lat2 - lat1);
                const lon = lon1 + frac * (lon2 - lon1);
                const time = new Date(new Date(trkpt1.time[0]['_']).getTime() + j * timeStep).toISOString();

                const wpt = {
                    $: {
                        lat: lat.toFixed(6),
                        lon: lon.toFixed(6),
                    },
                    name: [`${trkpt1.name[0]} - ${trkpt2.name[0]}`],
                    time: [time],
                };
                newWpts.push(wpt);
            }
        }
    }

    gpx.gpx.wpt = updateTimes(newWpts);
    return gpx;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

export const updateTimes = (wptPoints) => {
    const startingDate = new Date(2019, 11, 6, 14, 20, 50); // December 6th, 2019 at 2:19:00 PM

   return  wptPoints.map((item,index)=>({...item,time : [{ _: new Date(startingDate.getTime() + index * 2000).toISOString(), $: {} }]}))
}

const metersToKm = 0.001;

function setTimingForWaypoints(wpt, minSpeedKPH, maxSpeedKPH) {


    const earthRadiusKm = 6371;

    return wpt.map((currentWpt,index)=>
    {
        const prevWpt = wpt[index - 1];

        if (prevWpt) {
            const distance = calculateDistance(
                prevWpt.$.lat,
                prevWpt.$.lon,
                currentWpt.$.lat,
                currentWpt.$.lon,
                earthRadiusKm
            );

            const avgSpeedKPH = (minSpeedKPH + maxSpeedKPH) / 2;
            const timeInHours = distance / avgSpeedKPH;
            const timeInSeconds = timeInHours * 3600;

            return ({...currentWpt,time:[{ _: new Date(
                        new Date(prevWpt.time[0]['_']??prevWpt.time[0]).getTime() + timeInSeconds * 1000
                    ).toISOString(),
                }]})
        }
        else return currentWpt
    })
}

function calculateDistance(lat1, lon1, lat2, lon2, earthRadiusKm) {
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return distance / metersToKm;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
