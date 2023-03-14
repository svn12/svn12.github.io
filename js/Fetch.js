async function Rsheet(shtUrl) {
  const RSheet_API =
    "https://script.google.com/macros/s/AKfycby2wc_EZaX2pcqBgCApZz5C2ZfYX09GNGJ6IFygOaxsTtYeBgnKmkpJqeNhAo8-A-pVnQ/exec";
  const u = new URLSearchParams({ sheetUrl: shtUrl }).toString();
  //let urlParameters = Object.entries(a).map(e => e.join('=')).join('&');
  let url = RSheet_API + `?${u}`;
  return fetch(url, {}).then((response) => {
    // 這裡會得到一個 ReadableStream 的物件
    //console.log(response);
    // 可以透過 blob(), json(), text() 轉成可用的資訊
    return response.json();
  });
}
const isValidUrl = (urlString) => {
  return RegExp("^(http|www)").test(urlString);
};
const isValidDate = (buf) => {
  return buf.length >= 20 && new Date(buf) != "Invalid Date";
};

function Array2Json(res) {
  let headers = res.shift();

  // then build the json for each row
  let result = res.map(function (row) {
    let jsonRow = {};
    row.forEach(function (cellValue, cellIndex) {
      jsonRow[headers[cellIndex]] = cellValue;
    });
    return jsonRow;
  });
  res.unshift(headers);
  //console.log("result",result);
  return result; // 使用 json() 可以得到 json 物件
}
async function RsheetData(shtUrl, shtName) {
  const RSheet2Json_APIV6 =
    "https://script.google.com/macros/s/AKfycbz-Q9lP3QXasQwyCT6pegSR7eu23AQUKTkd3iv5WcZLvoxIaH0m41_W0av5Ncc3LTwoQw/exec";
  const RSheet2Json_APIV7 =
    "https://script.google.com/macros/s/AKfycbwW8w21yItaTo5-rrhxRkkkM2Y2g95rWV9ivbOaJBprrA-7_EbHOA2Wpdu2bN_F2FPB4Q/exec";

  let a = {
    sheetUrl: shtUrl,
    sheetTag: shtName, //'Main' //'Test'
  };
  const u = new URLSearchParams(a).toString();
  //let urlParameters = Object.entries(a).map(e => e.join('=')).join('&');
  let url = RSheet2Json_APIV7 + `?${u}`;
  //console.log(url);
  //url='https://randomuser.me/api/';

  return fetch(url, {})
    .then((response) => {
      return response.json();
    })

    .catch((err) => {
      console.log("錯誤:", err);
    });
}
async function Find_sheetData(shtUrl, shtName, findString) {
  const Search_API_V2 =
    "https://script.google.com/macros/s/AKfycbwPX2Kg04BkLlLAc4Xpzpzow3KQVNiZZpg1symjNFFIZOGTZo_PEjK-1W3u8BF4-0Yhgw/exec";
  const Search_API =
    "https://script.google.com/macros/s/AKfycbyqALYgYmkOq61OVNBD5M0dcSWP0Ims1LD5CzwrGnF-tIxdTRdqFfDmzXHBCX9YbL5MMg/exec";
  let a = {
    sheetUrl: shtUrl,
    sheetTag: shtName,
    findSting: findString,
  };
  const u = new URLSearchParams(a).toString();
  //let urlParameters = Object.entries(a).map(e => e.join('=')).join('&');
  let url = Search_API_V2 + `?${u}`;
  //console.log(url);
  //url='https://randomuser.me/api/';

  return fetch(url, {})
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log("錯誤:", err);
    });
}
function show_json(obj, ptr) {
  let jsonStr = JSON.stringify(obj);
  document.querySelector(ptr).textContent = jsonStr;
}

function TablePlot(dataS, title, sel, indexs, remarkidx) {
  // indexs --- x y1~yn
  const borderColors = ["#e8c3b9", "#3e95cd", "#8e5ea2", "#c45850", "#435850"];
  document.querySelector(sel).innerHTML = ""; //.empty();
  let g = document.createElement("canvas");
  g.setAttribute("id", "myChart2");
  g.setAttribute("style", "width:100%;max-width:90%;max-height:80%");
  document.querySelector(sel).appendChild(g);

  g = document.createElement("table");
  g.setAttribute("id", "myTable1");
  g.setAttribute("class", "table");

  document.querySelector(sel).appendChild(g);

  let data = [];
  let xd = indexs[0];
  indexs.shift();
  dataS.forEach((item, index) => {
    if (isValidDate(item[xd])) {
      dataT = [new Date(item[xd]).toLocaleDateString()];
    } else {
      dataT = [item[xd]];
    }

    indexs.forEach((x) => {
      dataT.push(item[x]);
    });
    data.push(dataT);
  });

  let heads = data.shift();
  xlabel = [];
  dataset = [];
  data.forEach((item) => {
    xlabel.push(item[0]);
  });

  for (let i = 1; i < heads.length; i++) {
    data_temp = [];
    data.forEach((item) => {
      data_temp.push(item[i]);
    });
    dataset.push({
      data: data_temp,
      label: heads[i],
      borderColor: borderColors[i - 1],
      fill: false,
    });
  }

  new Chart(document.getElementById("myChart2"), {
    type: "line",
    data: {
      labels: xlabel,
      datasets: dataset,
    },
    options: {
      title: {
        display: true,
        text: title,
      },
    },
  });
  if (remarkidx != null) {
    // Add remark field remarkidx
    data.forEach((item, index) => {
      data[index] = [...item, ...[dataS[index + 1][remarkidx]]]; // Add remark data
    });
    heads.push(dataS[0][remarkidx]);
    //
  }
  data.reverse();
  data.unshift(heads);
  TableShow(data, "#myTable1");
}

function TableShow(rrows, sel) {
  let table1 = document.querySelector(sel);
  table1.innerHTML = "";
  let tharr = rrows.shift();
  let row = table1.insertRow(0);
  tharr.map((elem, index) => {
    th = document.createElement("th");
    if (isValidDate(elem)) {
      th.innerHTML = new Date(elem).toLocaleDateString();
    } else {
      th.innerHTML = elem;
    }
    row.appendChild(th);
  });

  rrows.map((elem, index) => {
    let row = table1.insertRow(index + 1);
    elem.map((elem, index) => {
      let cell = row.insertCell(index);
      if (isValidUrl(elem)) {
        cell.innerHTML = `<a href="${elem}" target=_blank>${elem}</a>`;
      } else {
        if (Number.isFinite(elem) && !Number.isInteger(elem)) {
          cell.innerHTML = elem.toLocaleString(0, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } else {
          if (isValidDate(elem)) {
            cell.innerHTML = new Date(elem).toLocaleDateString();
          } else {
            cell.innerHTML = elem;
          }
        }
      }
    });
  });
  rrows.unshift(tharr);
}
function JSONTableShow(rrows, sel) {
  let table1 = document.querySelector(sel);
  table1.innerHTML = "";
  let tharr = Object.keys(rrows[0]);
  let row = table1.insertRow(0);
  tharr.map((elem, index) => {
    th = document.createElement("th");
    if (isValidDate(elem)) {
      th.innerHTML = new Date(elem).toLocaleDateString();
    } else {
      th.innerHTML = elem;
    }
    row.appendChild(th);
  });

  rrows.map((elem, index) => {
    let row = table1.insertRow(index + 1);
    tharr.map((ele, index) => {
      let cell = row.insertCell(index);
      if (isValidUrl(elem[ele])) {
        cell.innerHTML = `<a href="${elem[ele]}" target=_blank>${elem[ele]}</a>`;
      } else {
        if (
          Number.isFinite(Number(elem[ele])) &&
          !Number.isInteger(Number(elem[ele]))
        ) {
          cell.innerHTML = Number(elem[ele]).toLocaleString(0, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        } else {
          if (isValidDate(elem[ele])) {
            cell.innerHTML = new Date(elem[ele]).toLocaleDateString();
          } else {
            cell.innerHTML = elem[ele];
          }
        }
      }
    });
  });
}
function get_video_id(url) {
  url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return url[2] !== undefined ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}
//---------------
function autocomplete_CH(inp, arr, callback, parent_elem) {
  // ----------------------
  /*the autocomplete function takes two arguments,
		  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    let start_pos,
      mmatch,
      a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    // parent_elem.style.display = "none";
    if (parent_elem != null) {
      // parent_elem.setAttribute("style","display:table;");
      parent_elem.style.display = "none";
    } //2022/11/23}
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    //console.log(val);
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:
				if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {  
				mmatch=arr[i].toUpperCase().match(val.toUpperCase())*/

      mmatch = arr[i].match(val);
      //console.log(i,arr[i]);
      //console.log(mmatch);
      if (mmatch) {
        start_pos = mmatch?.index;
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        if (start_pos == 0) {
          b.innerHTML =
            "<strong>" + arr[i].substr(start_pos, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
        } else {
          b.innerHTML = arr[i].substr(0, start_pos);
          b.innerHTML +=
            "<strong>" + arr[i].substr(start_pos, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(start_pos + val.length);
        }

        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        // b.innerHTML = arr[i]+"<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          document.getElementById("location-input").value = inp.value;
          callback();
          // callback();
          /*close the list of autocompleted values,
					  (or any other open lists of autocompleted values:*/
          closeAllLists();
          //   parent_elem.style.display = "none";
          if (parent_elem != null) {
            // parent_elem.setAttribute("style","display:table;"); //2022/11/23
            parent_elem.style.display = "none";
          }
        });
        a.appendChild(b);
      }
    }
    if (a.childNodes.length > 0 && parent_elem != null) {
      //   parent_elem.setAttribute("style","display:none;");
      parent_elem.style.display = "none";
    } else {
      if (parent_elem != null) {
        //   parent_elem.setAttribute("style","display:table;"); //2022/11/23
        parent_elem.style.display = "";
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
				increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
				decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
			except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
function CreatOption(selector, opt_value, opt_text) {
  const select = document.querySelector(selector);
  select.innerHTML = "";

  opt_value.forEach((item, i) => {
    var opt = document.createElement("option");
    opt.value = item;
    opt.text = opt_text[i];
    select.appendChild(opt);
  });
}
