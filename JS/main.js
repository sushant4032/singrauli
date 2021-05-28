


var tem = document.querySelector('#tcard');
var clone = tem.content.cloneNode(true);
var cont = document.querySelector('.cont');
var fdate = document.querySelector('.date');
console.dir(fdate);
var today = new Date();
var date = today;
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
    cont.innerHTML = "";
    var d = date.getDate().toString().padStart(2, 0);
    var m = (date.getMonth()+1).toString().padStart(2, 0);
    var y = date.getFullYear();
    // fdate.value = `${y}-${m}-${d}`;
    var ds = `${d}-${m}-${y}`;
    fdate.innerText = ds;
    var str = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=330&date=' + ds;
    console.log(str);
    fetch(str)
        .then(response => response.json())
        .then(data => myf(data));
}




function myf(data) {

    // console.log(typeof (data));
    // console.log(data);

    d = data.sessions;
    d.forEach(e => {
        // console.log(e);
        var clone = tem.content.cloneNode(true);
        clone.querySelector('.name').innerText = e.address;
        clone.querySelector('.add').innerText = e.block_name + ", " + e.district_name + ", " + e.pincode;
        clone.querySelector('.type').innerText = e.vaccine;
        clone.querySelector('.age').innerText = e.min_age_limit + "+";

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

        var k = cont.appendChild(clone);
    })
}