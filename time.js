// Time management based on stack
// Source code is Developed by rainygirl ; http://rainygirl.com
// Idea by rath ; http://xrath.com/2012/05/time-management-based-on-stack/#comments

var tty = require('tty');
var timer=[0];
var items=[];
var item='';
var row=1;
var col=1;
var cnt=0;

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

var timetostr=function(i){
	hour=parseInt(i/3600);
	i=i%3600;
	minute=parseInt(i/60);
	second=i%60;
	if(hour<10) hour=[' ',hour].join('');
	if(minute<10) minute=['0',minute].join('');
	if(second<10) second=['0',second].join('');
	return [hour>0?hour:'',hour>0?':':'   ',minute,':',second].join('');
	
}
var len=function(s){
	if(s==undefined) return 0;
	rtn=0;
	for(var i=s.length-1;i>=0;i--) {
		rtn+=(s[i].charCodeAt(0)<9000)?1:2;
	}
	return rtn;
}
var refresh=function(){
	cnt++;
	process.stdout.write("\033[1;1H"+['-','\\','|','/'][cnt%4]);

	for(var i=items.length-1;i>=0;i--) {
		if(timer[i]==undefined || items[i]=='')
			timer[i]=0;
		else 
			timer[i]++;
		process.stdout.write(["\033[00;33m\033[",(i+1),";2H",(timer[i]==0?'         ':timetostr(timer[i]))].join(''));
	}
	process.stdout.write(["\033[",row,";",(col+14),"H\033[00;37m"].join(''));

	setTimeout(refresh,1000);
}
process.stdin.on('keypress', function(chr, key) {
	process.stdout.write("\033["+row+";"+(col+14)+"H");
	if (key==undefined) {
		item=[item,chr].join('');
        col+=(chr.charCodeAt(0)<9000)?1:2;
        process.stdout.write(chr);
	}
	else if (key.name.length==1) {
		item=[item,key.name].join('');
		col++;
		process.stdout.write(key.name);
	}
	else if(key!=undefined) switch(key.name) {
		case 'up' :
			if(row==1) break;
			if(item=='') {
				if (items.length==row) {
					process.stdout.write(["\033[",(items.length),';2H                                                   \033[',row,';',(col+14),'H'].join(''));
					items.remove(items.length-1);
					timer.remove(items.length-1);
				}
				else if(items.length>row) break;
			} else {
				items[row-1]=item;
			}
			row--;
			process.stdout.write("\033[1A");
            if(items.length==row-1) {
                process.stdout.write("\033[",row,";15H");
                col=1;
            }
            else { 
				charlen=len(items[row-1]);
                if(charlen<col-1) 
                    process.stdout.write("\033["+(col-charlen-1)+"D");
                else if(charlen>col-1) 
                    process.stdout.write("\033["+(charlen-col+1)+"C");
                col=charlen+1;
            }
			item=items[row-1];
			break;
		case 'down' :
		case 'enter' :
			if(item=='') break;
			if(row>items.length && key.name=='down') break;
			if(items[row-1]==undefined) timer[row-1]=0;
			items[row-1]=item;
			row++;
			process.stdout.write("\033[1B");
			if(items.length==row-1) {
				process.stdout.write(["\033[",row,';15H'].join(''));
				col=1;
				item='';
			}
			else {
				charlen=len(items[row-1]);
				if(charlen<col-1) 
					process.stdout.write("\033["+(col-charlen-1)+"D");
				else if(charlen>col-1)
					process.stdout.write("\033["+(charlen-col+1)+"C");
				col=charlen+1;
				item=items[row-1];
			}
			break;
		case 'left':
			if(col==1) break;
			col--;
			process.stdout.write("\033[1D");
			break;
		case 'right':
			if(col>len(item)) break;
			col++;
			process.stdout.write("\033[1C");
			break;
		case 'backspace':
			if(col==1) break;
			chr=item[item.length-1].charCodeAt(0);
			chrwidth=(chr<9000)?1:2;
			item=item.substr(0,item.length-1);
			col-=chrwidth;
			if(chrwidth==1)
	            process.stdout.write("\033[1D \033[1D");
			else
				process.stdout.write("\033[2D  \033[2D");
			break;
		case 'space':
			item=[item,' '].join('');
			col++;
            process.stdout.write(" ");
			break;
		default:
			break;
	}
	if (key && key.ctrl && key.name == 'c') {
		process.stdout.write("\n");
		console.log('Exit');
		console.log(items);
		process.exit()
	}
});

process.stdin.resume();
tty.setRawMode(true);
process.stdout.write('\033[2J\033[1;15H');

refresh();

