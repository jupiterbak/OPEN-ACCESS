var net = require('net');
var long = require("long");
var codes = require("./Cmd_Code");

const TCP_PORT = 5000;
const TCP_CLIENT_PORT = 5000;
const PROGRAM_MAX_CMD = 500;
const MAX_PROGRAM_DATA_LENGTH = (40 * 500);

var parseEParameterMode = function (data_long) {
    switch (data_long.low) {
        case 0:
            return 'ABSOLUTE';
        case 1 :
            return 'RV_DATA';
        default:
            return 'ABSOLUTE';
    }
};

var parseECmdMode = function (data_long) {
    switch (data_long.low) {
        case 0:
            return 'WCD';
        case 1 :
            return 'IM';
        default:
            return 'WCD';
    }
};

var parseECmd = function (data_long) {
    switch (data_long.low) {
        case 0:
            return 'CMD_NONE'; // "Kein Kommando angewählt" - "No command passed"
        case 1:
            return 'CMD_INIT'; // "Initialisierung" - "Inititalization"
        case 2:
            return 'CMD_STOP'; // "1. Abbruch eines aktiven Verfahrprogr. 2. Bahninterpolation stoppen 3. Auflösung eines evtl. Gleichlaufverbundes 4. Stoppen der Achse(n)" - "1. Abort an active motion prog. 2. Stop path interpolation 3. Dissolve any existing synchronism group  4. Stop the axis (axes)"
        case 3:
            return 'CMD_RESET'; // "Rücksetzen anstehender Bibliotheks- und TO-Fehler" - "Reset active library and TO errors"
        case 4:
            return 'CMD_MOVE'; 	//"Beschleunigung der Achse auf Geschwindigkeitssollwert (Einzelachse)" - "Acceleration of the axis to target velocity value (single axis)"
        case 5:
            return 'CMD_POS_ABS'; //"Absolute Einzelachspositionierung" - "Absolute single axis positioning"
        case 6:
            return 'CMD_POS_REL';//    , "Relative Einzelachspositionierung" - "Relative single axis positioning"
        case 7:
            return 'CMD_POWER_ON';//"Achsfreigabe(n) Lageregler" - "Axis enable(s), position control"
        case 8:
            return 'CMD_POWER_OFF';//"Wegnahme der Achsfreigabe(n), Lageregler sperren" - "Cancel axis enable(s), disable position control"
        case 9:
            return 'CMD_HOMING';//"Referenziervorgang starten" - "Start referencing"
        case 10:
            return 'CMD_SET_VELO';//"Setzen der Sollgeschwindigkeit einer Einzelachse" - "Set the target velocity of a single axis"
        case 11:
            return 'CMD_SET_ACCEL';//"Setzen der positiven Achsbeschleunigung" - "Set the positive axis acceleration"
        case 12:
            return 'CMD_SET_DECEL';//"Setzen der negativen Achsbeschleunigung" - "Set the negative axis acceleration"
        case 13:
            return 'CMD_SET_JERK ';//"Setzen aller Ruckwerte" - "Set all jerk values"
        case 14:
            return 'CMD_GEAR_IN_REL';//"Relativer Basisgleichlauf mit sofortiger Aufsynchronisierung" - "Relative basic synchronism with immediate synchronization"
        case 15:
            return 'CMD_GEAR_OUT';//"Basisgleichlauf deaktivieren mit sofortiger Absynchronisierung" - "Deactivate basic synchronism with immediate desynchronization"
        case 16:
            return 'CMD_SET_PATH_VELO';//"Setzen der Bahngeschwindigkeit" - "Set the path velocity"
        case 17:
            return 'CMD_SET_PATH_ACCEL';//"Setzen der positiven Bahnbeschleunigung" - "Set the positive path acceleration"
        case 18:
            return 'CMD_SET_PATH_DECEL';//"Setzen der negativen Bahnbeschleunigung" - "Set the negative path acceleration"
        case 19:
            return 'CMD_SET_PATH_JERK';//"Setzen aller Ruckwerte der Bahn" - "Set all jerk values of the path"
        case 20:
            return 'CMD_REDEFINE_POSITION';//"Setzen des Achskoordinatensystem" - "Set the axis coordinate system"
        //case 21';//"----------" - "----------"
        case 22:
            return 'CMD_START_PROGRAM';//"Start des Verfahrprogramms mit der angegebenen Satznummer" - "Start motion program with the specified block number"
        case 23:
            return 'CMD_JUMP_TO_SETNUMBER';//"Unbedingter Sprung innerhalb des Verfahrprogrammes" - "Unconditional jump within the motion program"
        case 24:
            return 'CMD_WAIT_FOR_CONDITION';//"Hält Verfahrprogrammabarbeitung solang an, bis die Bedingung erfüllt ist" - "Halt motion program execution until condition is met"
        //case 25';//"----------" - "----------"
        case 26:
            return 'CMD_WAIT_FOR_PATH_POSITION';//"Hält Verfahrprogrammabarbeitung solange an, bis Vergleichsbedingung der Bahnposition erfüllt ist" - "Halt motion program execution until path position condition is met"
        case 27:
            return 'CMD_WAIT_FOR_AXIS_POSITION';//"Hält Verfahrprogrammabarbeitung solange an, bis Vergleichsbedingung der Einzelachsposition erfüllt ist" - "Halt motion program execution until axis position condition is met"
        case 28:
            return 'CMD_WAIT_TIME';//"Wartet mit angegebener Zeit, bevor das nächste Kommando abgearbeitet wird Die Zeit wird in tMon vorgegeben" - "Wait the specified time before executing the next command"(" \ "), "The time is specified in tMon"
        case 29:
            return 'CMD_NEXT_STEP';//"Verfahrprogramm wird schrittweise mit aufsteigender Satznummer abgearbeitet" - "Execute motion program step by step in ascending order of block numbers"(" \ "), "Each issuing of the command triggers execution of the next program block"
        case 30:
            return 'CMD_STOP_PROGRAM';//"Stoppt das Verfahrprogramm, bearbeitet aktuellen Satz zu Ende" - "Stop motion program, after completing execution of current block"
        case 31:
            return 'CMD_CONTINUE_PROGRAM';//"Setzt das zuvor gestoppte Programm fort  (alte Restwege, wenn vorhanden werden zu Ende verfahren)" - "Continue previous stopped motion program, any distances-to-go are traveled to their end"
        case 32:
            return 'CMD_POS_ABS_XYZ';//"Absolute kartesische Bahnpositionierung" - "Start absolute path positioning"
        case 33:
            return 'CMD_POS_REL_XYZ';//"Relative kartesische Bahnpositionierung" - "Start relative path positioning"
        //case 34';//"----------" - "----------"
        case 35:
            return 'CMD_POS_SEG_ABS';//"Start der Segmentpositionierung" - "Start segment positioning"
        case 36:
            return 'CMD_CAM_IN_ABS';//"Absoluter Basiskurvengleichlauf mit sofortiger Aufsynchronisierung Kurve steht in der jeweiligen Technologie-Achsstrukur unter sAx[..]. toCam" - "Absolute basic cam synchronism with immediate synchronization Cam in the corresponding technology axis structure under sAx[..] toCam"
        case 37:
            return 'CMD_CAM_OUT ';//"Basiskurvengleichlauf deaktivieren mit sofortiger Absynchronisierung" - "Deactivate basic cam synchronism with immediate desynchronization"
        //case 38';//"----------" - "----------"
        case 39:
            return 'CMD_GEAR_IN_ABS';//"Absoluter Basisgleichlauf mit sofortiger Aufsynchronisierung" - "Absolute basic synchronism with immediate synchronization"
        case 40:
            return 'CMD_PATH_STOP';//"Stoppen des Bahnobjekts unter Beachtung der aktuellen Bahndynamiken" - "Stop the path object, taking into account the current dynamic properties of the path"
        case 41:
            return 'CMD_SET_PATH_DELTA';//"Vorgabe der Bahnauflösung für dynamische Kollisionskontrolle bei der Segmenterstellung (Defaultwert 2mm)" - "Define the path resolution for dynamic collision monitoring when calculating a segment (default value 2 mm)"
        case 42:
            return 'CMD_GEAR_IN_REL_SUPERIMPOSED';//"Relativer überlagerter Gleichlauf mit sofortiger Aufsynchronisierung" - "Relative superimpsed synchronism with immediate synchronization"
        case 43:
            return 'CMD_GEAR_IN_ABS_SUPERIMPOSED';//"Absoluter überlagerter Gleichlauf mit sofortiger Aufsynchronisierung" - "Absolute superimposed synchronism with immediate synchronization"
        case 44:
            return 'CMD_GEAR_OUT_SUPERIMPOSED';//"Überlagerten Gleichlauf deaktivieren mit sofortiger Absynchronisierung" - "Deactivate superimposed synchronism with immediate desynchronization"
        case 45:
            return 'CMD_CAM_IN_ABS_SUPERIMPOSED';//"Absoluter überlagerter Kurvengleichlauf mit sofortiger Aufsynchronisierung Kurve steht in der jeweiligen Technologie-Achsstrukur unter sAx[..]. toCam" - "Absolute superimposed cam synchronism with immediate synchronization Cam in the corresponding technology axis structure under sAx[..] toCam"
        case 46:
            return 'CMD_CAM_OUT_SUPERIMPOSED';//"Überlagerten Kurvengleichlauf deaktivieren mit sofortiger Absynchronisierung" - "Deactivate superimposed cam synchronism with immediate desynchronization"
        case 47:
            return 'CMD_WAIT_FOR_AXIS_CLAMPED';//"Warte bis Achse geklemmt ist CMD_EN_MOVE_TO_END_STOP" - "Wait until axis is clamped CMD_EN_MOVE_TO_END_STOP"
        case 48:
            return 'CMD_WAIT_FOR_AXIS_OPERATING_AT_TORQUE_LIMIT';//"Warte bis Achse an der Drehmomentgrenze betrieben wird CMD_EN_TORQUE_LIMITING" - "Wait until axis is operated at the torque limit CMD_EN_TORQUE_LIMITING"
        //case 49';//"----------" - "----------"
        //case 50';//"----------" - "----------"
        //case 51';//"----------" - "----------"
        //case 52';//"----------" - "----------"
        //case 53';//"----------" - "----------"
        //case 54';//"----------" - "----------"
        //case 55';//"----------" - "----------"
        case 56:
            return 'CMD_JMP';//"Unbedingter Sprung innerhalb des Verfahrprogrammes" - "Conditional jump within the motion program"
        case 57:
            return 'CMD_JMPN';//"Unbedingter Sprung innerhalb des Verfahrprogrammes" - "Conditional jump within the motion program"
        case 58:
            return 'CMD_INTERRUPT_PROGRAM';//"Stoppt das Verfahrprogramm, bricht alle Bewegungen ab wobei Restwege erhalten werden" - "Stop motion program, abort any active motion, distances-to-go remain stored"
        //case 59';//"----------" - "----------"
        case 60:
            return 'CMD_POS_BASIC_SEGMENT';//"Starte Einfachsegment" - "Start basic segment"
        case 61:
            return 'CMD_WAIT_POS_BASIC_SEG_END';//"Warte bis Positionierung Einfachsegment beendet ist" - "Wait until positioning basic segement is finished"
        case 62:
            return 'CMD_CREATE_SEG_BY_BASIC_SEG';//"Erstelle Segment aus Geometrie des Einfachsegments" - "Create segment based on the geometry of the basic segment"
        case 63:
            return 'CMD_RESET_RV_RANGE';//"Lösche Bereich des L-REAL Datenfeldes" - "Delete range of the L-Real data array"
        case 64:
            return 'CMD_CALC_VELO_PROFILE';//"Berechnen des Geschwindigkeitsprofils für ein vorhandenes Bahnsegment"  - "Calculate the velocity profile for an existing path segment"
        case 65:
            return 'CMD_POS_SEG_START';//"Führt eine lineare Positionierung zum gewählten Punkt innerhalb des angegebenen Segments aus" - "Execute a linear positioning motion to the selected point within the specified segment"
        case 66:
            return 'CMD_SET_CONDITION';//"Setze boolesche Bedingung" - "Set boolean condition"
        case 67:
            return 'CMD_SET_RV ';//"Setze LREAL-Wert" - "Set LREAL-value"
        case 68:
            return 'CMD_INTERRUPT_MOTION';//"Unterbricht aktuell laufende Achsbewegungen, wobei die Restwege erhalten bleiben" - "Stop currently running axis motion, distances-to-go remain stored"
        case 69:
            return 'CMD_CONTINUE_MOTION';//"Setzt Achsbewegungen fort, Restwege werden abgefahren" - "Continue axis motions, remaining distances-to-go are completed"
        case 70:
            return 'CMD_PATH_INTERRUPT';//"Unterbricht eine aktuell laufende Bahnbewegung, wobei der Restweg erhalten bleibt" - "Stop the currently running path motion, distance-to-go remains stored"
        case 71:
            return 'CMD_PATH_CONTINUE';//"Setzt eine aktuell laufende Bahnbewegung fort, der Restweg wird zu Ende verfahren" - "Continue movement of the path axis, the remaining distance-to-go is completed"
        case 72:
            return 'CMD_CALC_PROFILE_TIME';//"Berechnen der Zeit, die für das Abfahren eines Geschwindigkeitsprofils benötigt wird" - "Calculate the time required to travel a velocity profile Time is saved (in ms) in the segment.sVeloProfile.rCalcTime variable"
        case 73:
            return 'CMD_POS_TO_LIMIT';//"Positioniert so weit wie möglich zum Zonenrand unter Vermeidung von Kollisionen und unter Beachtung des angegebenen Sicherheitsabstands" - "Position a geometric axis as far as possible in the specified direction without causing a collision and maintaining the specified safety clearance to the zone edge."
        case 74:
            return 'CMD_STEP_TO_LIMIT';//"Berechnen der Position, bis zu der ohne Kollision in Richtung einer GeoAchse positioniert werden kann" - "Calculate the maximum position to which a geometric axis can be positioned in the specified direction without causing a collision"
        case 75:
            return 'CMD_SET_ZONES';//"Zonen aktivieren / deaktivieren" - "Activate / deactivate zones"
        case 76:
            return 'CMD_GET_COLL_DETAILS';//"Das Kommando liefert deailierte Kollisionsinformationen zu einer Position. Es werden die Bits boCollision der einzelnen aktivierten Zonen gesetzt." - "Retrieve detailed collision information for a specified position. The boCollision bits of the individual activated zones are set."
        case 77:
            return 'CMD_CLEAR_COLL_DETAILS';//"Rücksetzen aller Kollisionsbits boCollision sowie der Sammelbits boCollStat und boCollDyn in Abhängigkeit von Parameter 1" - "Reset all boCollision collision bits, as well as the overall bits boCollStat and boCollDyn, in accordance with Parameter 1"
        case 78:
            return 'CMD_ZONE_CHECK';//"Aktivierung / Deaktivierung der Zonenüberwachung für bestimmte Zonentypen" - "Activates / deactivates the zone monitoring for respective zone types"
        case 79:
            return 'CMD_POS_SYNC_AX_START';//"Positionierung der Synchronachse zur Sollposition am Anfang oder Ende des betreffenden Segments" - "Positioning of the synchronous axis to the set position at the begin or end of the respective segment"
        case 80:
            return 'CMD_WAIT_POS_SEG_END';//"Warten auf das Erreichen des Segmentendes beim Abfahren des aktuellen Segments" - "Wait until the segment end is reached when traveling the current segment"
        case 81:
            return 'CMD_EMERGENCY_ON';//"Not-Halt Sequenz" - "Emergency stop sequence"
        case 82:
            return 'CMD_CREATE_SEG';//"Berechnung des angegebenen Segments" - "Calculate the specified segment"
        case 83:
            return 'CMD_CREATE_FOL_SEG';//"Berechnung eines Folgesegments anhand eines Quellsegments zum fliegenden Segmentwechsel mittels des Kommandos CMD_POS_FOL_SEG" - "Calculate the following segment on the basis of a source segment, for on-the-fly segment switching by way of the CMD_POS_FOL_SEG command"
        case 84:
            return 'CMD_POS_FOL_SEG';//"Ablösendes Positionieren des Folgesegments" - "Substitutional positioning of the following segment"
        case 85:
            return 'CMD_SET_CAM';//"Setze TO-Kurvenscheibe während des Betriebs" - "Set To cam disk during operation"
        case 86:
            return 'CMD_SWITCH_CS';//"Dieses Kommando initiiert einen Wechsel des Koordinatensystems" - "Initiates switching of the coordinate system"
        case 87:
            return 'CMD_CREATE_POLY';//"----------" - "----------"
        case 88:
            return 'CMD_ENABLE_TRACKING';//"Mit diesem Kommando wird der eigentliche Aufsynchronisiervorgang bei einem Wechsel in ein OCS mit veränderlichem Leitwert eingeleitet" - "Initiates the actual process of synchronization when switching to an OCS with variable master value"
        case 89:
            return 'CMD_CLONE_SEG';//"Das Kommando kopiert ein Segment in ein Zielsegment und kann zum Erzeugen von mehreren Stapelsegmenten verwendet werden" - "The command copies a segment into a target segment and can be used to generate stacking segments"
        case 90:
            return 'CMD_SET_STACK';//"Das Kommando setzt die Anzahl von Lagenoffsets (relative Stapelhöhe) an Anfang und am Ende eines Segments" - "The command sets the number of layer offsets /relative stacking height) at the start and at the end of a segment"
        case 91:
            return 'CMD_INC_STACK';//"Das Kommando erhöht bzw. verringert die relative Stapelhöhe am Anfang und am Ende eines Segments" - "The command increases or reduces the number of layers in a stack at the start and end of a segment"
        case 92:
            return 'CMD_EXT_KINTRANS';//"Aktivierung / Deaktivierung der externen (freien) Transformation" - "Activates / deactivates the external (free) transformation"
        case 93:
            return 'CMD_EN_MOVE_TO_END_STOP';//"Aktiviert die Funktion Fahren auf Festanschlag" - "Activates the function Move to endstop"
        case 94:
            return 'CMD_DIS_MOVE_TO_END_STOP';//"Deaktiviert die Funktion Fahren auf Festanschlag" - "Deactivates the function Move to endstop"
        case 95:
            return 'CMD_EN_TORQUE_LIMITING';//"Aktiviert die Momentenreduzierung" - "Activates the torque reduction"
        case 96:
            return 'CMD_DIS_TORQUE_LIMITING';//"Deaktiviert die Momentenreduzierung" - "Deactivates the torque reduction"
        case 97:
            return 'CMD_CLOSE_GRIPPER';//"Positioniert die Greiferachse auf die angegebene Position" - "Positions the gripper axis to the set position"
        case 98:
            return 'CMD_OPEN_GRIPPER';//"Positioniert die Greiferachse auf die angegebene Position" - "Positions the gripper axis to the set position"
        case 99:
            return 'CMD_SET_MOTION_PROG_STATE';//"Ausgabe des Programmstatus an die Variable ...program.i32MotionProgramState" - "Output of the programm status at the variable ...program.i32MotionProgramState"
        case 100:
            return 'CMD_WRITE_PROGRAM_SET';//"Programmsatz ins Handlingsprogramm überschreiben" - "Overwrite program block into handling program"
        case 101:
            return 'CMD_READ_PROGRAM_SET';//"Programmsatz aus Handlingsprogramm lesen" - "Read program block from handling program"
        case 102:
            return 'CMD_DELETE_PROGRAM_SET';//"Programmsatz im Handlingsprogramm löschen" - "Delete program block from handling program"
        case 103:
            return 'CMD_INSERT_PROGRAM_SET';//"Programmsatz ins Handlingsprogramm einfügen" - "Insert program block into handling program"
        case 104:
            return 'CMD_WRITE_POINT';//"Punkt in Segmenttabeelle überschreiben" - "Overwrite point into segment table"
        case 105:
            return 'CMD_READ_POINT';//"Punkt aus Segmenttabeelle lesen" - "Read point from segment table"
        case 106:
            return 'CMD_DELETE_POINT';//"Punkt in Segmenttabeelle löschen" - "Delete point from segment table"
        case 107:
            return 'CMD_INSERT_POINT';//"Punkt in Segmenttabeelle einfügen" - "Insert point into segment table"
        case 108:
            return 'CMD_SAVE_DATASET';//"Handlingsprogramm und Segmenttabellen auf Memory Card löschen" - "Save handling program and segment tables on the memory card"
        case 109:
            return 'CMD_LOAD_DATASET';//"Handlingsprogramm und Segmenttabellen von der Memory Card laden"  - "Load handling program and segment tables from the memory card"
        case 110:
            return 'CMD_CLUTCH_CS';//"Ein vorbereitetes CS wird direkt eingekoppelt. Ist im neuen CS eine Bewegung aktiv, erfolgt ein Stop im neuen CS" - "A prepared CS is directly switched to. Is a motion in the new CS active, a stop is excecuted in the new CS"
        case 111:
            return 'CMD_SET_TRACKING_SHIFT';//"Setzt den Offset (rTrackingShift) eines bewegten OCS zu dessen konfigurierter Basislage" - "Sets the offset (rTrackingShift) of a moving OCS respective to its configured base position"
        case 112:
            return 'CMD_OUTPUT_CAM';//"Dieses Kommando schaltet die Bearbeitung der Nockenfunktionalität ein oder aus" - "This command enables and disables the execution of the output cam functionality"
        case 113:
            return 'CMD_OUTPUT_CAM_STATE';//"Mit diesem Kommando lässt sich der Ausgang eines einzelnen Nocken oder aller vorhandenen Nocken ein- / ausschalten" - "This command sets or resets the state of one single output cam or of all implemented output cams"
        case 120:
            return 'CMD_CAM_IN_REL';//"Das Kommando startet einen relativen Basis-Kurvenscheiben- gleichlauf" - "The Command starts a relative basic camming"
        case 121:
            return 'CMD_CAM_IN_REL_SUPERIMPOSED';//"Das Kommando startet einen relativen überlagerten Kurvenscheiben- gleichlauf" - "The Command starts a relative superimposed camming"
        case 122:
            return 'CMD_GEAR_IN_VELO';//"Das Kommando startet einen Basis Geschwindigkeits- gleichlauf" - "The command starts a basic velocity gearing"
        case 123:
            return 'CMD_GEAR_IN_VELO_SUPERIMPOSED';//"Das Kommando startet einen überlagerten Geschwindigkeits- gleichlauf" - "The command starts a superimposed velocity gearing"
        case 124:
            return 'CMD_GEAR_OUT_VELO';//"Das Kommanod deaktiviert einen Basis Geschwindigkeits- gleichlauf" - "The command deactivates a basic velocity gearing"
        case 125:
            return 'CMD_GEAR_OUT_VELO_SUPERIMPOSED';//"Das Kommando deaktiviert einen überlagerten Geschwindigkeits- gleichlauf" - "The command deactivates a superimposed velocity gearing"
        case 130:
            return 'CMD_CONTINUE_MANUAL';//"Zuvor gesetztes CMD_EMERGENCY_ON wird zurückgenommen und der Betrieb fortgesetzt" - "Disables a previously set CMD_EMERGENCY_ON and continues the motion"
        default:
            return 'CMD_NONE';
    }
};


var tcp_server = function () {
    this.clients = [];
    this.demonstrator_programm = {
        name: "",
        length: 0,
        programm: []
    };
    this.server = null;
    this.writeBuffer = new Buffer(2000);
};


tcp_server.prototype.getClients = function () {
    return this.clients;
};

tcp_server.prototype.parseProgramm = function (data, name) {
    var self = this;
    var i = 0, k = 0;
    var _buf = Buffer.from(data);
    var tmp = {
        name: " - ",
        length: 0,
        programm: []
    };

    // Set the name of the program
    tmp.name = name;

    // Check the Buffer length
    var _buf_size = _buf.length;
    // Extract the content of the buffer
    if (_buf_size > 0) {
		// Extract the cmd
		//console.log("PROGRAM DATA FROM SOMOTION SIZE:",_size_program);
		var _size_program = PROGRAM_MAX_CMD;
        if (_size_program > 0) {
            for (k = 0; k < _size_program; k++) {
                var objCmd = {
                    eCmd: 'CMD_NONE',
                    eMode: 'WCD',
                    aParameter1: 0.0,
                    aParameter2: 0.0,
                    aParameter3: 0.0,
                    eParameterMode: 'ABSOLUTE',
                    tMon: 0
                };
                // extract the programm commands at the position k
                i = k * 40; // a command is encoded using 40 Bytes

                // Extract the command
                bufTmp = _buf.slice(i, i + 4);

                var eCmd = long.fromString(bufTmp.toString('hex'), 16);
                objCmd.eCmd = parseECmd(eCmd);

                // Extract the command mode
                bufTmp = _buf.slice(i + 4, i + 8);
                var eCmdMode = long.fromString(bufTmp.toString('hex'), 16);
                objCmd.eMode = parseECmdMode(eCmdMode);

                // Extract the parameters
                objCmd.aParameter1 = _buf.readDoubleBE(i + 8, true);
                objCmd.aParameter2 = _buf.readDoubleBE(i + 16, true);
                objCmd.aParameter3 = _buf.readDoubleBE(i + 24, true);

                // Extract the Parameter mode
                bufTmp = _buf.slice(i + 32, i + 36);
                var eParameterMode = long.fromString(bufTmp.toString('hex'), 16);
                objCmd.eParameterMode = parseEParameterMode(eParameterMode);

                // Extract tMon
                objCmd.tMon = _buf.readUInt32BE(i + 36, true);

                // Add Object to the tmp
                tmp.programm.push(objCmd);
            }
        }
        tmp.length = _size_program;
    }

    // Overwrite the main program
    self.demonstrator_programm = tmp;
};

tcp_server.prototype.encodeCmd = function (objCmd, buffer, index) {
    // Write eCmd code
    var codeObj = codes.getCodes();
    for (var k in codeObj) {
        if (codeObj.hasOwnProperty(k) && k === objCmd.eCmd) {
            buffer.writeUInt32BE(codeObj[k], index);
        }
    }

    // Write eMode
    if (objCmd.eMode === 'WCD') {
        buffer.writeUInt32BE(0, index + 4);
    } else {
        buffer.writeUInt32BE(1, index + 4);
    }

    // Write aParameter1
    buffer.writeDoubleBE(objCmd.aParameter1, index + 8);
    //buffer.writeUInt32BE(0, index + 12);

    // Write aParameter2
    buffer.writeDoubleBE(objCmd.aParameter2, index + 16);
    //buffer.writeUInt32BE(0, index + 20);

    // Write aParameter3
    buffer.writeDoubleBE(objCmd.aParameter3, index + 24);
    //buffer.writeUInt32BE(0, index + 28);

    // Write eParameterMode
    if (objCmd.eParameterMode === 'ABSOLUTE') {
        buffer.writeUInt32BE(0, index + 32);
    } else {
        buffer.writeUInt32BE(1, index + 32);
    }

    // Write tMon
    buffer.writeUInt32BE(objCmd.tMon, index + 36);
};

tcp_server.prototype.initializeServer = function (port, data_callback) {
    this.port = port || TCP_PORT;
    var self = this;

    // Initialize a TCP Server
    self.server = net.createServer(function (socket) {
        // Identify this client
        socket.name = socket.remoteAddress + ":" + socket.remotePort;

        // Put this new client in the list
        self.clients.push(socket);

        // Handle incoming messages from clients.
        socket.on('data', function (data) {
            self.parseProgramm(data, socket.name);
            var dataObj = self.getDemonstratorProgram();
            data_callback(
                {
                    err: null,
                    data: dataObj
                }
            );
        });

        // Add a 'close' event handler to this instance of socket
        socket.on('close', function (data) {
			self.server.listen(self.port);
            data_callback(
                {
                    err: 'TCP CONNECTION CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort,
                    data: null
                }
            );
        });

        // Add a 'error' event handler to this instance of socket
        socket.on('error', function (data) {
            data_callback(
                {
                    err: 'TCP CONNECTION ERROR: ' + socket.remoteAddress + ' ' + socket.remotePort,
                    data: null
                }
            );
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            self.clients.splice(clients.indexOf(socket), 1);
        });

        // Send a message to all clients
        function broadcast(message, sender) {
            self.clients.forEach(function (client) {
                // Don't want to send it to sender
                if (client === sender) return;
                client.write(message);
            });
        }
    });
};

tcp_server.prototype.getDemonstratorProgram = function () {
    return this.demonstrator_programm;
};

tcp_server.prototype.startServer = function () {
    var intPort = this.port || TCP_PORT;
    this.server.listen(intPort);
};

tcp_server.prototype.stopServer = function () {
    this.server.close(function () {
        // Put a friendly message on the terminal of the server.
        console.log("Demonstrator tcp server closed at port " + intPort);
    });
};

tcp_server.prototype.stopServer = function (callback) {
    this.server.close(callback);
};

tcp_server.prototype.initializeMainClient = function (host,port) {
    this.client_port = port || TCP_CLIENT_PORT;
    this.client_host = host || '127.0.0.1';
    var self = this;

    // Initialize a TCP Client
    self.main_client = new net.Socket();
	self.main_client.setTimeout(30000,function(){
		self.main_client.connect(self.client_port, self.client_host, function() {
			console.log('PROGRAM DATA FROM CLOUD CLIENT Connected after timeout');
		});
	});
	
    self.main_client.connect(this.client_port, this.client_host, function() {
        console.log('PROGRAM DATA FROM CLOUD CLIENT  Connected');
    });

	self.main_client.on('error', function (err) {
		setTimeout(function(){
			self.main_client.connect(self.client_port, self.client_host, function() {
				console.log('PROGRAM DATA FROM CLOUD CLIENT Connected after error');
			});
		}, 30000);
        console.log('PROGRAM DATA FROM CLOUD CLIENT  ERROR: ' +err.message);
    });
	
    // Add a 'error' event handler to this instance of socket
    self.main_client.on('close', function () {
		setTimeout(function(){
			self.main_client.connect(self.client_port, self.client_host, function() {
				console.log('PROGRAM DATA FROM CLOUD CLIENT after closed');
			});
		}, 30000);
        console.log('PROGRAM DATA FROM CLOUD CLIENT closed!');
    });
};

tcp_server.prototype.mainClientWrite = function (prgObj) {
    var k = 0;
    var self = this;
    if(self.main_client){
        // Encode data
		//console.log("PROGRAM DATA FROM CLOUD --> New KTCP DATA: length = " + prgObj.length);		
		var l = prgObj.length;
		if(l <= PROGRAM_MAX_CMD){ 
			self.writeBuffer = new Buffer((40 * PROGRAM_MAX_CMD) + 8);
			self.writeBuffer.fill(0);			
			// write the program length
			self.writeBuffer.writeDoubleBE(l, 0);
			for(k=0;k < l; k++){
				var _index = (k * 40) + 8;
				self.encodeCmd(prgObj[k],self.writeBuffer,_index);
			}
			// Fill unused buffer bytes
			//console.log("PROGRAM DATA FROM CLOUD --> DATA = " + self.writeBuffer.toString('hex'));
			
			self.main_client.write(self.writeBuffer);
		}
    }
};

module.exports = tcp_server;