// Copyright (C) 2013 Ubinity SAS - Cedric Mesnil 
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
// 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
//


function  TLVDecoder(tlvlist, compact) {

        function byteAt(str, offset) {
                var b = str.substring(offset, offset+2);
                return parseInt(b,16);
        };

        /**
         * return assoc list { TAG: <number> , LENGTH:<number>,  VALUE: <string>} 
         */
        function find(tag) {
                for (var i = 0; i < this.arrayTLV.length; i++) {
                        if (this.arrayTLV[i].TAG == tag) {
                                return this.arrayTLV[i];
                        }
                }
                return undefined;
        };
        /** return string value or undefined */
        function findValue(tag) {
                var tlv = this.find(tag);
                if (tlv != undefined) {
                        return tlv.VALUE;
                }
                return undefined;
        };
        
        function toString() {
                var str = "";
                for (var i = 0; i < this.arrayTLV.length; i++) {
                        str = str +
                                "{ \n"+
                                "  TAG: "+this.arrayTLV[i].TAG.toString(16) +"\n"+
                                "  LEN: "+this.arrayTLV[i].LENGTH.toString(16) +"\n"+
                                "  VAL: "+this.arrayTLV[i].VALUE.toString(HEX) +"\n"+
                                "}\n";
                }
                return str;
        };
        
        this.find      = find;
        this.findValue = findValue;
        this.toString  = toString;
        this.arrayTLV  = [];

        var index = 0;
        var offset = 0;
        var length = tlvlist.length;
        var tag,len,value;
        while (offset < length) {
                if (compact) {
                        //tag/len in one byte
                        var b =  byteAt(tlvlist, offset);
                        tag = (b>>4)&0x0F;
                        len = b&0xF;
                        offset+=2; 
                } else {
                        //tag
                        tag = byteAt(tlvlist, offset);
                        offset+=2; 
                        if ((tag&0x1F) == 0x1F) {
                                tag = (tag <<8 ) | byteAt(tlvlist,offset);
                                offset+=2;
                        }
                        //len
                        len =  byteAt(tlvlist, offset);
                        offset+=2;
                        if (len & 0x80) {
                                if (len == 0x81) {
                                        len =  byteAt(tlvlist, offset);
                                        offset += 2;
                                }
                                else if (len == 0x82) {
                                        len =  (byteAt(tlvlist, offset)<<8)|byteAt(tlvlist, offset+1);
                                        offset += 4;
                                } else {
                                        throw "Invalid Length:" + length;
                                }
                        }
                        
                }
                
                //value
                len = 2*len;
                value = tlvlist.substring(offset, offset+len);
                offset += len;
                
                this.arrayTLV[index] = { TAG:  tag, LENGTH: len, VALUE: value};
                index ++;
        }        
}

function  openpgpSC(reader_name) {

        function debug(str) {
                console.log(str);
        };
        
        function sendAPDU(cla, ins, p1, p2, data, expected, extended) {
                var rapdu = undefined;
                if (expected == undefined) {
                        expected = [0x9000];
                }
                rapdu= this.reader.exchange(cla, ins, p1, p2, undefined, data, extended);                
                rapdu.push(checkSW(rapdu[1],expected));
                return rapdu;
        };

        
        function reset() {
                this.reader.reset();
        };

        function select() {
                var rapdu;
                debug("PGP select");                
                rapdu = this.sendAPDU(0x00, 0xA4, 0x04, 0x00, this.AID);
                debug("PGP end select");
                return rapdu;
        }

        /** Verify pin, return true or false
         * whichPIN: 81, 82 or 83
         * PINvalue: PIN hexstring value
         */
        function verify(whichPIN, PINvalue) {
                debug("PGP verify");
                var rapdu = undefined;
                rapdu  = this.sendAPDU(0x00,this.INS.VERIFY, 0x00, whichPIN, PINvalue);
                debug("PGP end verify: "+rapdu[1].toString(16));
                return rapdu;
        };

        /** reset PW1 pin, return true or false
         */
        function resetPW(whichPIN, PINvalue) {
                debug("PGP resetPW");
                var rapdu = undefined;
                rapdu = this.sendAPDU(0x00,this.INS.RESET_RETRY_COUNTER, 0x02, whichPIN, PINvalue);
                debug("PGP end resetPW: "+rapdu[1].toString(16));
                return rapdu;
        };

        /** generate requested key
         */
        function generate(keytemplate) {
                debug("PGP generate");
                var rapdu = undefined;
                rapdu = this.sendAPDU(0x00,this.INS.GENERATE, 0x80, 0x00, keytemplate);
                debug("PGP end generate: "+rapdu[1].toString(16));
                return rapdu;
        };

        
        /** 
         * tag: number tag to retrieve. See this.TAG
         *
         * return tuple (data, sw)
         * data is ByteString
         * sw is integer
         */
        function getData(tag) {
                debug("PGP getData");
                var rapdu = undefined;
                rapdu = this.sendAPDU(0x00,this.INS.GET_DATA, (tag>>8)&0xFF, tag&0xFF);
                debug("PGP end getData: "+rapdu[1].toString(16));
                return rapdu;
        };
        
        /**
         * tag: tag to put
         * value:String value of tag, without outer tag/length
         */
        function putData(tag, value) {
                debug("PGP putData: "+tag.toString(16),+", "+value);
                var rapdu = undefined;
                rapdu = this.sendAPDU(0x00,this.INS.PUT_DATA, (tag>>8)&0xFF, tag&0xFF, value);
                debug("PGP end putData: "+rapdu[1].toString(16));
                return rapdu
        };

        function decrypt(indata) {
                debug("PGP decrypt: "+ indata);
                var rapdu = undefined;
                indata =  "00"+indata;
                var xlc = indata.length/2;
                indata = scardjs.hexl(xlc,2)+indata+"0200";
                rapdu = this.sendAPDU(0x00,this.INS.PSO_DECRYPT, 0x80, 0x86, indata, undefined, true);
                debug("PGP end decrypt");
                return rapdu;
        };
        
        /** sign given data
         */
        function sign(indata) {
                debug("PGP sign");
                var rapdu = undefined;
                var xlc = indata.length/2;
                indata = scardjs.hexl(xlc,2)+indata+"0200";
                rapdu = this.sendAPDU(0x00,this.INS.PSO_SIGN, 0x9E, 0x9A, indata, undefined, true);
                debug("PGP end sign: "+rapdu[1].toString(16));
                return rapdu;
        };

        /* -------- HIGH LEVEL API ------- */
        function setReader(reader_name) {
                this.closeSession();
                if (reader_name) {
                        this.reader = this.scard.getReader(reader_name);
                }
                return (this.reader != undefined);
        }

        function closeSession() {
                this.PINcache = [];
                this.card = {};
                this.config = {};
                this.inited = false;
                if (this.reader) {
                        this.reader.disconnect(scardjs.getSCardConst('SCARD_UNPOWER_CARD'));
                }
        }

        function initSession() {
                this.PINcache = [];
                this.card = {};
                this.config = {};
                this.reader.powerUp();
                this.select();
                this.fetchCardData();                                
                this.inited = true;
                return this.inited;
        }

        function initSessionCached() {
                //TODO: insert code here to check card changed and reset inited
               // if (this.inited) {
               //         return true;
               // }
                return this.initSession();
        }

        function fetchCardData() {
                var rapdu, decoder;
                this.card = {};
                // --- get and parse holder ---
                rapdu = this.getData(this.TAG.HOLDER);                
                decoder = new TLVDecoder(rapdu[0]);
                this.card.name = decoder.findValue(this.TAG.NAME);
                this.card.lang = decoder.findValue(this.TAG.LANG);
                this.card.sex  = decoder.findValue(this.TAG.SEX);
                
                // --- get and parse appdata
                rapdu = this.getData(this.TAG.APP_DATA);              
                decoder = new TLVDecoder(rapdu[0]);
                this.card.aid             = decoder.findValue(this.TAG.AID);
                this.card.historicalBytes = decoder.findValue(this.TAG.HIST);
                var dataobject            = decoder.findValue(this.TAG.DATA_OBJECT);
                decoder = new TLVDecoder(dataobject);
                this.card.extended_capabilities = decoder.findValue(this.TAG.EXTENDED_CAPA);
                this.card.attrib_sig     = decoder.findValue(this.TAG.ATTR_SIG);
                this.card.attrib_dec     = decoder.findValue(this.TAG.ATTR_DEC);
                this.card.attrib_auth    = decoder.findValue(this.TAG.ATTR_AUTH);
                this.card.PWStatus       = decoder.findValue(this.TAG.PW_STATUS);
                var fingerprints         = decoder.findValue(this.TAG.FINGERS);
                this.card.finger_sig     = fingerprints.substring(0,40);
                this.card.finger_dec     = fingerprints.substring(40,80);
                this.card.finger_auth    = fingerprints.substring(80,120);
                fingerprints             = decoder.findValue(this.TAG.FINGERS_CA);
                this.card.finger_ca_sig  = fingerprints.substring(0,40);
                this.card.finger_ca_dec  = fingerprints.substring(40,80);
                this.card.finger_ca_auth = fingerprints.substring(80,120);
                fingerprints             = decoder.findValue(this.TAG.DATES);
                this.card.date_sig       = fingerprints.substring(0,8);
                this.card.date_dec       = fingerprints.substring(8,16);
                this.card.date_auth      = fingerprints.substring(16,24);


                //config reader
                decoder = new TLVDecoder(this.card.historicalBytes.substring(2,this.card.historicalBytes.length-6), true);
                var capa = decoder.findValue(0x07);
                if (capa) {
                        capa = capa.substring(4,6);
                        capa = parseInt(capa,16);                
                        var config = this.reader.getConfig();
                        config.extendedLengthSupported = ((capa & 0x40) == 0x40);
                        config.autoChaining            = ((capa & 0x80) == 0x80);
                        this.reader.setConfig(config);
                }
                
                return this.card;
        };
        

        /** return hex string of finger print */
        function getFingerPrint(tag) {
                if (!this.card) {
                        return undefined;
                }
                switch (tag) {
                case this.TAG.FINGER_SIG:
                        return this.card.finger_sig;
                case this.TAG.FINGER_DEC:
                        return this.card.finger_dec;
                case this.TAG.FINGER_AUTH:
                        return this.card.finger_auth;
                }
                return undefined;
        };
        
        /** Invalidate PIN cache */
        function invalidatePINs() {
                this.PINcache = [];
        }

        /** Return true or false */
        function verifyPIN(whichPIN, PINvalue) {            
                //invalidate pin cache
                var pcache = whichPIN;
                if (pcache == this.PIN.PW1_CDS) {
                        pcache = this.PIN.PW1;
                }
                this.PINcache[pcache] = undefined;
                var rapdu = this.verify(whichPIN, PINvalue);
                if (rapdu[2]) {
                        this.PINcache[pcache] = PINvalue;
                }
                return rapdu[2];
        };

        /** return decrypted data */
        function decryptData(indata) {
                if (this.PINcache[this.PIN.PW1] == undefined) {
                        return false;
                }
                if (!this.verifyPIN(this.PIN.PW1, this.PINcache[this.PIN.PW1])) {
                        return null;
                }
                var rapdu = this.decrypt(indata);
                if (rapdu[2]) {
                        return rapdu[0];
                }
                return null;
        };

        /** return decrypted data */
        function signData(indata) {
                if (this.PINcache[this.PIN.PW1] == undefined) {
                        return false;
                }
                if (!this.verifyPIN(this.PIN.PW1_CDS, this.PINcache[this.PIN.PW1])) {
                        return null;
                }
                var rapdu = this.sign(indata);
                if (rapdu[2]) {
                        return rapdu[0];
                }
                return null;
        };


           
        /**
         * tag:     number      the tag to check
         * value:   ByteString  the expected_value
         * tlvlist: ByteString  tlvlist containing the tested tlv
         */
        function checkTagValue(tag, expected_value, tlv_list, errlog) {
                debug("check tlv '"+tag.toString(16)+":"+expected_value.toString(HEX)+"' in '"+tlv_list.toString(HEX)+"'");
                var tlvs = new TLVDecoder(tlv_list);
                var tlv = tlvs.find(tag);
                if (tlv == undefined) {
                        return false;
                }
                return this.checkValue(tlv.VALUE, expected_value, errlog);
        };        
        
        function checkSW(sw, allowed) {
                var ok = allowed.indexOf(sw) != -1;
                return ok;
        };

        
        /* Convert a string to binarystring. ie each caracter is replace by its char code.
         * @param {string} str    string to encode
         * @return binary string
         * @private
         */
         function hexs(str) {
                var x = "";
                for (i =str.length-1;i>=0; i--) {
                        x = scardjs.hexl(str.charCodeAt(i))+x;
                }
                return x;
        };


        // --- INTERFACE ---
        this.hexs = hexs;
        
        this.sendAPDU = sendAPDU; 
        this.reset = reset;
        this.select = select;
        this.verify = verify;
        this.resetPW = resetPW;
        this.generate = generate;    
        this.sign = sign;
        this.getData = getData;
        this.putData = putData;
        this.decrypt = decrypt;
        
        this.setReader = setReader;
        this.initSession = initSession;
        this.initSessionCached = initSessionCached;
        this.closeSession = closeSession;
        this.fetchCardData = fetchCardData;
        this.getFingerPrint = getFingerPrint;
        this.verifyPIN = verifyPIN;
        this.decryptData = decryptData;
        this.signData = signData;

        this.AID = "D27600012401";

        this.INS = {
                GET_DATA:            0xCA,
                PUT_DATA:            0xDA,
                VERIFY:              0x20,
                RESET_RETRY_COUNTER: 0x2C,
                GENERATE:            0x47,
                PSO_SIGN:            0x2A,
                PSO_DECRYPT:         0x2A
        };
        
        this.PIN = {
                PW1_CDS : 0x81,
                PW1     : 0x82,
                PW3     : 0x83
        };
        
        this.KEY = {
                
                
        };
        
        this.TAG = {
                DO01:           0x0101,
                DO02:           0x0102,
                DO03:           0x0103,
                DO04:           0x0104,
                
                AID:            0x4F,
                NAME:           0x5B,
                LOGIN:          0x5E,
                LANG:           0x5F2D,
                SEX:            0x5F35,
                URL:            0x5f50,
                HIST:           0x5f52,
                
                HOLDER:         0x65,
                APP_DATA:       0x6E,
                
                SECU_TEMPLATE:  0x7A,
                HOLDER_CERT:    0x7f21,

                EXTENDED_CAPA:  0xC0,

                ATTR_SIG:       0xC1,
                ATTR_DEC:       0xC2,
                ATTR_AUTH:      0xC3,
                
                PW_STATUS:      0xC4,

                FINGERS:        0xC5,
                FINGERS_CA:     0xC6,

                FINGER_SIG:     0xC7,
                FINGER_DEC:     0xC8,
                FINGER_AUTH:    0xC9,
                FINGER_CA_SIG:  0xCA,
                FINGER_CA_DEC:  0xCB,
                FINGER_CA_AUTH: 0xCC,

                DATES:          0xCD,
                DATE_SIG:       0xCE,
                DATE_DEC:       0xCF,
                DATE_AUTH:      0xD0,
                
                KEY_ENC:        0xD1,
                KEY_MAC:        0xD2,
                
                RC_CODE:        0xD3,
                
                KEY_ENC_MAC:    0xF4,            

                DATA_OBJECT:    0x73
        };
        
        this.VALUES = {
                defaultPW1:    "313233343536",
                defaultPW3:    "3132333435363738",
                
                SEX_MALE:      "31",
                SEX_FEMALE:    "32",
                SEX_UNDEF:     "39",
                
                LANG_FR:       hexs("fr"),
                LANG_EN:       hexs("en"),
                LANG_DE:       hexs("de"),
                
                CRT_GEN_SIG:   "B600",
                CRT_GEN_DEC:   "B800",
                CRT_GEN_AUTH:  "A400"
        };        



        // --- INIT --- 
        this.scard = new scardjs.SCardContext();
        this.scard.establish();        
        this.inited = false;
}
