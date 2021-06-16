
var cont = document.querySelector('.cont');
var fdate = document.querySelector('.date');
var global_data = "";

var date = new Date();

var filter_applied = false;
var filters = {
    covonly: false,
    coxonly: false,
    plus18: false,
    plus45: false
}


srart();


async function srart() {
    var data = await getData(date);
    var doses = countDoses(data);
    if (doses == 0) {
        date.setDate(date.getDate() + 1);
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
    // fdate.value = `${y}-${m}-${d}`;
    var ds = `${d}-${m}-${y}`;
    fdate.innerText = ds;
    var str = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=380&date=' + ds;
    console.log(str);
    var d = await fetch(str);
    var e = await d.json();
    console.log(e);
    return e.sessions;
}

function countDoses(data) {
    var total = 0;
    data.forEach(x => {
        total += x.available_capacity;
    })
    // console.log('total:', total);
    return total;
}

document.querySelector('.prev').addEventListener('click', async e => {
    date.setDate(date.getDate() - 1);
    global_data = await getData(date);
    refresh();
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
        var t = input.filter(x => {
            return x.min_age_limit == 18 && x.available_capacity > 0;
        })
        input = t;
    }
    if (filters.plus45) {
        var t = input.filter(x => {
            return x.min_age_limit == 45 && x.available_capacity > 0;
        })
        input = t;
    }
    if (filters.covonly) {
        var t = input.filter(x => {
            return x.vaccine == 'COVISHIELD' && x.available_capacity > 0;
        })
        input = t;
    }
    if (filters.coxonly) {
        var t = input.filter(x => {
            return x.vaccine == 'COVAXIN' && x.available_capacity > 0;
        })
        input = t;
    }



    var t = input.sort(function (a, b) {
        return b.available_capacity - a.available_capacity;
    });
    input = t;

    console.log('input length: ', input.length);
    var output = [];

    input.forEach((x, i) => {
        // x.vaccine = 'COVAXIN';
        // console.log(x, i);
        var id = +x.center_id;
        var age = x.min_age_limit;
        var type = x.vaccine;
        var name = x.name;
        var avl = x.available_capacity;
        var d1 = x.available_capacity_dose1;
        var d2 = x.available_capacity_dose2;



        var dobj = {
            'type': type,
            'd1': d1,
            'd2': d2,
            'total': d1 + d2
        }

        var found = false;
        // if found
        output.forEach((y, j) => {
            if (y.id == id) {
                if (age == 18) {
                    y.y18 = dobj;
                }
                else {
                    y.y45 = dobj;
                }
                found = true;
                // break;
            }
        })
        // if not found
        if (!found) {
            var k = {
                'id': id,
                'name': name
            }
            if (age == 18) {
                k.y18 = dobj;
            }
            else {
                k.y45 = dobj;
            }
            output.push(k);
        }
    })

    // if (filter_applied) {
        //     var t = output.filter(x => {
        //         console.log(x);
        //         return (x.d1+x.d2) > 0;
        //     })
        //     output = t;
        // }

        console.log('output length:', output.length);
        console.log(output);
        display2(output);
    }

    function display2(d) {
        var cont2 = document.querySelector('.cont2');
        cont2.innerHTML = "";
        if (d.length > 0) {
            d.forEach(e => {
                var clone = document.querySelector('#tcard2').content.cloneNode(true);
                var name = clone.querySelector('.name');

                var y18 = clone.querySelector('.y18');
                var y18type = clone.querySelector('.y18 .type');
                var y18d1 = clone.querySelector('.y18 .d1q');
                var y18d2 = clone.querySelector('.y18 .d2q');

                var y45 = clone.querySelector('.y45');
                var y45type = clone.querySelector('.y45 .type');
                var y45d1 = clone.querySelector('.y45 .d1q');
                var y45d2 = clone.querySelector('.y45 .d2q');

                name.innerHTML = e.name;
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

                var k = cont2.appendChild(clone);
            })
            showdata();
        }
        else {
            if (filter_applied) {
                nodata("NOT AVAILABLE!");
            }
            else if (date.getTime() < new Date().getTime()) {
                nodata("DATA REMOVED !");
            }
            else {
                nodata("ALLOTEMENT NOT DONE YET !");
            }
        }
        // visitCount();
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

        if (filters.covonly || filters.coxonly || filters.plus18 || filters.plus45) { filter_applied = true; }
        else { filter_applied = false; }
        console.log(filter_applied);

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