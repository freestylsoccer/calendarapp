import app from 'firebase/app';
import 'firebase/auth';
//import 'firebase/database';
import 'firebase/firestore';
import 'firebase/functions';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  //storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
    this.db = app.firestore();
    this.timeStamp = app.firestore.FieldValue.serverTimestamp();    
    this.createUser = app.functions().httpsCallable('createUser');
    this.deactivateUser = app.functions().httpsCallable('deactivateUser');
    this.changeClaim = app.functions().httpsCallable('changeClaim');
  }
  // *** Auth API ***
 
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);
  
  doCreateUsers = (data) =>
    this.createUser(data);
  
  doDeactivateUser = (data) =>
    this.deactivateUser(data);
  
  doChangeClaim = (data) => 
    this.changeClaim(data);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
  
  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      
      let sessionTimeout = null;
      
      if (authUser) {
        this.users()
        .doc(authUser.uid)
        .get()
        .then(function(doc) {
          const dbUser = {}
          if (doc.exists) {
              // console.log("Document data:", doc.data());
              dbUser.role = doc.data().role;
              dbUser.firstName = doc.data().firstName;
              dbUser.lastName = doc.data().lastName;
              dbUser.employeeId = doc.data().employeeId;
              dbUser.companyId = doc.data().companyId;
          } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
              // dbUser.role = null;
          }
          
          // merge auth and db user
          authUser = {
            uid: authUser.uid,
            email: authUser.email,
            ...dbUser,
          };
          next(authUser);          
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
        
        authUser.getIdTokenResult().then((idTokenResult) => {
          // Make sure all the times are in milliseconds!
          const authTime = idTokenResult.claims.auth_time * 1000;
          // Add a custom claim indicating an expiration time of 8 hours.
          const sessionDuration = 1000 * 60 * 60 * 8;
          const millisecondsUntilExpiration = sessionDuration - (Date.now() - authTime);          
          sessionTimeout = setTimeout(() => this.auth.signOut(), millisecondsUntilExpiration);
        });
      } else {
        // User is logged out.
        // Clear the session timeout.
        sessionTimeout && clearTimeout(sessionTimeout);
        sessionTimeout = null;

        fallback();
      }      
    });
  
  // *** User API ***
  users = () => this.db.collection('users');

  // *** Calendar API ***
  agenda = () => this.db.collection('agenda');

  // *** Attendance API ***
  attWorkSchedule = () => this.db.collection('WorkSchedule');
  attWorkScheduleSearch = () => this.db.collection('WorkScheduleSearch');
  attHolidayCalendar = () => this.db.collection('HolidayCalendar');
  attHolidayCalendarSearch = () => this.db.collection('HolidayCalendarSearch');
  attendance = () => this.db.collection('attendance');

  // *** Timestamp API ***
  getTimestamp = () => this.timeStamp;

  // *** Time Off API ***
  timeType = () => this.db.collection('TimeType');
  hollidayCalendar = () => this.db.collection('HollidayCalendar');

  // *** Pick List API ***
  pickList = () => this.db.collection('PickList');
  toUnit = () => this.db.collection('TO_Unit');
  toClassification = () => this.db.collection('TO_Classification');
  toAbsenceClass = () => this.db.collection('TO_AbsenceClass');
  toPermittedFractionsforUnitDay = () => this.db.collection('TO_PermittedFractionsforUnitDay');
  toPermittedFractionsforUnitHour = () => this.db.collection('TO_PermittedFractionsforUnitHour');
  toDurationDisplayAccordingTo = () => this.db.collection('TO_DurationDisplayAccordingTo');
  toBalanceCalculationSetting = () => this.db.collection('TO_BalanceCalculationSetting');
  toTimeAccountType = () => this.db.collection('TimeAccountType');
  
  // *** Workflow API ***
  workflow = () => this.db.collection('WorkFlow');
}
 
export default Firebase;