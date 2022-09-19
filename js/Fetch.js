


async function Rsheet(shtUrl){
	const RSheet_API='https://script.google.com/macros/s/AKfycby2wc_EZaX2pcqBgCApZz5C2ZfYX09GNGJ6IFygOaxsTtYeBgnKmkpJqeNhAo8-A-pVnQ/exec';
	const u = new URLSearchParams({sheetUrl:shtUrl}).toString();	
	//let urlParameters = Object.entries(a).map(e => e.join('=')).join('&');
	let url=RSheet_API+`?${u}`;
	return fetch(url, {})
			.then((response) => {
    // 這裡會得到一個 ReadableStream 的物件
    //console.log(response);
    // 可以透過 blob(), json(), text() 轉成可用的資訊
			return response.json(); 
			})
}

async function RsheetData(shtUrl,shtName){
	const RSheet2Json_APIV6='https://script.google.com/macros/s/AKfycbz-Q9lP3QXasQwyCT6pegSR7eu23AQUKTkd3iv5WcZLvoxIaH0m41_W0av5Ncc3LTwoQw/exec'
	let a = {
		sheetUrl:shtUrl,
		sheetTag: shtName //'Main' //'Test'
		};
	const u = new URLSearchParams(a).toString();	
	//let urlParameters = Object.entries(a).map(e => e.join('=')).join('&');
	let url=RSheet2Json_APIV6+`?${u}`;
	//console.log(url);
	//url='https://randomuser.me/api/';
	
	 return fetch(url, {})
		  .then((response) => {
			// 這裡會得到一個 ReadableStream 的物件
			//console.log(response);
			// 可以透過 blob(), json(), text() 轉成可用的資訊
			return response.json(); 
			})
			.then(res => {
			// retrieve headers (i.e. remove first row)
			
			let headers = res.shift();

		// then build the json for each row
			let result = res.map(function(row) {
			let jsonRow = {};
			row.forEach(function(cellValue, cellIndex) { 
				jsonRow[headers[cellIndex]] = cellValue;
			});
			return jsonRow;
			});
			console.log("result",result);
			return result;   // 使用 json() 可以得到 json 物件
			})
		  .catch((err) => {
			console.log('錯誤:', err);
			});
}

function show_json(obj,ptr) {
		
		let jsonStr = JSON.stringify(obj);
        document.querySelector(ptr).textContent=  jsonStr;
		//   document.body.innerHTML = jsonStr;
		   /*
                // $("#demo2").html('');
                let txt='<br> <h1 align="center">'+ obj.v_name+'</h1>';
                    // txt += '<table  class="table  table-hover "> <thead><tr>';
                     txt += '<table  class="table"> <tbody>';

                for (x in obj.record){
                // $("#demo2").append ("<br>"+chap+":"+obj.record[x].sec+" "+obj.record[x]["bible_text"]+ "<br>"+chap+":"+obj2.record[x].sec+" "+obj2.record[x]["bible_text"]);
                    txt += "<tr>";
                    txt += '<td valign="top"> <font size="-1">'+
                            chap+":"+obj.record[x].sec + "</font> </td>";
                    txt += "<td>" + obj.record[x]["bible_text"] + "</td>";
                    txt += "</tr>";

                }
                txt += "</tbody></table>"
                document.querySelector(ptr).html=txt;          
        */
    }
function get_video_id(url) {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

