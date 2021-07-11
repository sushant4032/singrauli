
var cont = document.querySelector('.cont');
var fdate = document.querySelector('.date');
var global_data = "";
var doses = 0;

var date = new Date();
var today = new Date();

var filter_applied = false;
var filters = {
    covonly: false,
    coxonly: false,

    // plus18: false,
    // plus45: false
    first: false,
    second: false,
}

srart();

async function srart() {
    var data = await getData(date);
    doses = countDoses(data);
    if (doses == 0) {
        date.setDate(date.getDate() + 1);
        data = await getData(date);
        doses = countDoses(data);
    }
    if (doses == 0) {
        date.setDate(date.getDate() + 1);
        data = await getData(date);
        doses = countDoses(data);
    }
    if (doses == 0) {
        date.setDate(date.getDate() + 1);
        data = await getData(date);
        doses = countDoses(data);
    }
    if (doses == 0) {
        date.setDate(date.getDate() - 3);
        data = await getData(date);
        doses = countDoses(data);
    }
    global_data = data;
    refresh();
}

async function getData(date) {
    nodata('FETCHING DATA...');
    var d = date.getDate().toString().padStart(2, 0);
    var m = (date.getMonth() + 1).toString().padStart(2, 0);
    var y = date.getFullYear();
    var dateString = `${d}-${m}-${y}`;
    fdate.innerText = dateString;
    var str = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=330&date=' + dateString;
    var res = await fetch(str);
    var jsonData = await res.json();
    var data = jsonData.sessions;
    doses = countDoses(data);
    return data;
}

function countDoses(data) {
    var total = 0;
    data.forEach(x => {
        total += x.available_capacity;
    })
    return total;
}

document.querySelector('.prev').addEventListener('click', async e => {
    console.log(date.getDate(), new Date().getDate())
    if (date.getDate() > new Date().getDate()) {
        date.setDate(date.getDate() - 1);
        global_data = await getData(date);
        refresh();
    }
})

document.querySelector('.next').addEventListener('click', async e => {
    date.setDate(date.getDate() + 1);
    global_data = await getData(date);
    refresh();
})

function refresh() {
    var input = global_data;

    // input.forEach((x, i) => {
    //     var k = Math.round(100 * Math.random())
    //     if (k % 5 == 0) x.vaccine = 'COVAXIN';
    // }) 

    if (filters.plus18) {
        var input = input.filter(x => {
            return x.min_age_limit == 18 && x.available_capacity > 0;
        })
    }
    if (filters.plus45) {
        var input = input.filter(x => {
            return x.min_age_limit == 45 && x.available_capacity > 0;
        })
    }
    if (filters.covonly) {
        var input = input.filter(x => {
            return x.vaccine == 'COVISHIELD' && x.available_capacity > 0;
        })
    }
    if (filters.coxonly) {
        var input = input.filter(x => {
            return x.vaccine == 'COVAXIN' && x.available_capacity > 0;
        })
    }
    if (filters.first) {
        var input = input.filter(x => {
            return x.available_capacity_dose1 > 0;
        })
    }
    if (filters.second) {
        var input = input.filter(x => {
            return x.available_capacity_dose2 > 0;
        })
    }

    var input = input.sort(function (a, b) {
        return b.available_capacity - a.available_capacity;
    });

    console.log('input length: ', input.length);
    var output = [];

    input.forEach((x, i) => {
        var id = +x.center_id;
        var age = x.min_age_limit;
        var type = x.vaccine;
        var name = x.name;
        var avl = x.available_capacity;
        var d1 = x.available_capacity_dose1;
        var d2 = x.available_capacity_dose2;
        var allAge = x.allow_all_age ?? false;
        var address = 'PIN' + ': ' + x.pincode;

        var obj = {
            'type': type,
            'd1': d1,
            'd2': d2,
            'total': d1 + d2,
        }

        var found = false;
        // if found
        output.forEach((y, j) => {
            if (y.id == id) {
                if (age == 18) {
                    y.y18 = obj;
                }
                else {
                    y.y45 = obj;
                }
                found = true;
                // break;
            }
        })

        // if not found
        if (!found) {
            var k = {
                'id': id,
                'name': name,
                'address': address,
                'allAge': allAge
            }
            if (age == 18) {
                k.y18 = obj;
            }
            else {
                k.y45 = obj;
            }
            output.push(k);
        }
    })

    console.log('output length:', output.length);
    display(output);
}

function display(d) {
    var cont2 = document.querySelector('.cont');
    cont2.innerHTML = "";
    if (d.length > 0) {
        d.forEach(e => {
            var clone = document.querySelector('#tcard').content.cloneNode(true);
            var name = clone.querySelector('.name');
            var address = clone.querySelector('.address');

            var y18 = clone.querySelector('.y18');
            var y18type = clone.querySelector('.y18 .type');
            var y18d1 = clone.querySelector('.y18 .d1q');
            var y18d2 = clone.querySelector('.y18 .d2q');

            var y45 = clone.querySelector('.y45');
            var y45type = clone.querySelector('.y45 .type');
            var y45d1 = clone.querySelector('.y45 .d1q');
            var y45d2 = clone.querySelector('.y45 .d2q');

            name.innerHTML = e.name;
            address.innerText = e.address;

            if (e.y18) {
                y18.classList.remove('hidden');
                y18type.innerHTML = e.y18.type;
                y18type.classList.add(e.y18.type);
                y18d1.innerHTML = e.y18.d1;
                if (e.y18.d1) y18d1.classList.add('avl');
                y18d2.innerHTML = e.y18.d2;
                if (e.y18.d2) y18d2.classList.add('avl');
            }
            if (e.y45) {
                y45.classList.remove('hidden');
                y45type.innerHTML = e.y45.type;
                y45type.classList.add(e.y45.type);
                y45d1.innerHTML = e.y45.d1;
                if (e.y45.d1) y45d1.classList.add('avl');
                y45d2.innerHTML = e.y45.d2;
                if (e.y45.d2) y45d2.classList.add('avl');
            }
            if (e.allAge) {
                clone.querySelector('.above-45').classList.add('hidden');
                clone.querySelector('.age18').innerText = "Age: Any 18+"
            }
            var k = cont2.appendChild(clone);
        })
        showData();
    }
    else {
        console.log(doses);
        if (doses > 0) {
            nodata("NOT AVAILABLE !");
        }
        else {
            var future = date.getTime() > new Date().getTime();
            if (future) {
                nodata("SLOTS NOT LISTED !");
            }
            else {
                nodata("SLOTS NOT AVAILABLE !");
            }
        }
    }
}


function showData() {
    var nodata = document.querySelector('.nodata');
    var data = document.querySelector('.data');
    nodata.classList.add('hidden');
    data.classList.remove('hidden');
}

function nodata(text) {
    var nodata = document.querySelector('.nodata');
    var data = document.querySelector('.data');
    data.classList.add('hidden');
    nodata.classList.remove('hidden');
    nodata.querySelector('p').innerText = text;
}

document.querySelector('.contact-me').addEventListener('click', () => {
    document.querySelector('.contact-form').classList.toggle('hidden');
})

Object.keys(filters).forEach(x => {
    var btn = document.querySelector("." + x);
    btn.addEventListener('click', e => {
        var k = e.target.attributes[1].value;
        applyFilter(k);
    })
})
function applyFilter(f) {


    if (f == 'plus18') {
        filters.plus18 = !filters.plus18;
        filters.plus45 = false;
    }
    else if (f == 'plus45') {
        filters.plus45 = !filters.plus45;
        filters.plus18 = false;
    }
    else if (f == 'covonly') {
        filters.covonly = !filters.covonly;
        filters.coxonly = false;
    }
    else if (f == 'coxonly') {
        filters.coxonly = !filters.coxonly;
        filters.covonly = false;
    }
    else if (f == 'first') {
        filters.first = !filters.first;
        filters.second = false;
    }
    else if (f == 'second') {
        filters.second = !filters.second;
        filters.first = false;
    }

    if (filters.covonly || filters.coxonly || filters.plus18 || filters.plus45 || filters.first || filters.second) { filter_applied = true; }
    else { filter_applied = false; }

    Object.keys(filters).forEach(x => {
        var btn = document.querySelector("." + x);

        if (filters[x]) {
            btn.classList.add('set');
        }
        else {
            btn.classList.remove('set');
        }
    })
    refresh();
}