

var tem = document.querySelector('#tcard');
var cont = document.querySelector('.cont');
var fdate = document.querySelector('.date');
var gdata = "";
var today = new Date();
var date = today;


var filters = {
    covonly: false,
    coxonly: false,
    plus18: false,
    plus45: false
}

Object.keys(filters).forEach(x => {
    var btn = document.querySelector("." + x);
    btn.addEventListener('click', e => {
        var k = e.target.attributes[1].value;
        // console.log(k);
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

update();
// date.setDate(date.getDate() - 5);

document.querySelector('.prev').addEventListener('click', e => {
    date.setDate(date.getDate() - 1);
    update();
})

document.querySelector('.next').addEventListener('click', e => {
    date.setDate(date.getDate() + 1);
    update();
})


function update() {
    nodata('LOADING...');
    var d = date.getDate().toString().padStart(2, 0);
    var m = (date.getMonth() + 1).toString().padStart(2, 0);
    var y = date.getFullYear();
    // fdate.value = `${y}-${m}-${d}`;
    var ds = `${d}-${m}-${y}`;
    fdate.innerText = ds;
    var str = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=330&date=' + ds;
    console.log(str);
    fetch(str)
        .then(response => response.json())
        .then(data => {
            gdata = data;
            refresh();
        });
}


function refresh() {
  
    cont.innerHTML = "";
    var data = gdata;
    var d = data.sessions;
    if (filters.plus18) {
        var t = d.filter(x => {
            return x.min_age_limit == 18;
        })
        d = t;
    }
    if (filters.plus45) {
        var t = d.filter(x => {
            return x.min_age_limit == 45;
        })
        d = t;
    }
    if (filters.covonly) {
        var t = d.filter(x => {
            return x.vaccine == 'COVISHIELD';
        })
        d = t;
    }
    if (filters.coxonly) {
        var t = d.filter(x => {
            return x.vaccine == 'COVAXIN';
        })
        d = t;
    }
    // var t = d.sort(function (a, b) {
    //     return b.available_capacity - a.available_capacity;
    // });
    // d = t;
    display(d);

}

function display(d) {
    var td = {
        cov: {
            a18: { d1: 0, d2: 0 },
            a45: { d1: 0, d2: 0 }
        },
        cox: {
            a18: { d1: 0, d2: 0 },
            a45: { d1: 0, d2: 0 }
        },
    };

    if (d.length > 0) {
        d.forEach(e => {
            var clone = tem.content.cloneNode(true);

            clone.querySelector('.name').innerText = e.address;
            clone.querySelector('.add').innerText = e.block_name + ", " + e.district_name + ", " + e.pincode;
            clone.querySelector('.type').innerText = e.vaccine;
            clone.querySelector('.age').innerText = "age " + e.min_age_limit + "+";

            var first = clone.querySelector('.first');
            first.innerText = e.available_capacity_dose1;
            if (e.available_capacity_dose1 > 0) {
                first.classList.add('avl');
            }
            var sec = clone.querySelector('.second');
            first.innerText = e.available_capacity_dose1;
            if (e.available_capacity_dose2 > 0) {
                sec.classList.add('avl');
            }

            clone.querySelector('.second').innerText = e.available_capacity_dose2;

            if (e.available_capacity > 0) {
                clone.querySelector('.card').classList.add('green');

            }

            var k = cont.appendChild(clone);
            if (e.vaccine == 'COVISHIELD') {
                if (e.min_age_limit == 18) {

                    td.cov.a18.d1 += e.available_capacity_dose1;
                    td.cov.a18.d2 += e.available_capacity_dose2;
                }
                else {
                    td.cov.a45.d1 += e.available_capacity_dose1;
                    td.cov.a45.d2 += e.available_capacity_dose2;
                }
            }
            else {
                if (e.min_age_limit == 18) {
                    td.cox.a18.d1 += e.available_capacity_dose1;
                    td.cox.a18.d2 += e.available_capacity_dose2;
                }
                else {
                    td.cox.a45.d1 += e.available_capacity_dose1;
                    td.cox.a45.d2 += e.available_capacity_dose2;
                }
            }
        })
        showdata();
    }
    else {
        nodata("NO RESULTS !");
    }
    document.querySelector('.covrow').innerHTML = `<td>COVISHIELD</td><td> ${td.cov.a18.d1} / ${td.cov.a18.d2}<td>${td.cov.a45.d1} / ${td.cov.a45.d2}`;
    document.querySelector('.coxrow').innerHTML = `<td>COVAXIN</td><td> ${td.cox.a18.d1} / ${td.cox.a18.d2}<td>${td.cox.a45.d1} / ${td.cox.a45.d2}`;
}


function showdata() {
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
