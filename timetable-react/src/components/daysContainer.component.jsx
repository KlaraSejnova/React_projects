import DayFridayItem from "./dayFriday.component";
import DayMondayItem from "./dayMonday.component";
import DayThursdayItem from "./dayThursday.component";
import DayTuesdayItem from "./dayTuesday.component";
import DayWednesdayItem from "./dayWednesday.component";

const DaysContainerItem = () => {
  return (
    <div className="days flex-column gap-7 border border-black-100 rounded-lg p-20 shadowinner">
      <DayMondayItem></DayMondayItem>
      <DayTuesdayItem></DayTuesdayItem>
      <DayWednesdayItem></DayWednesdayItem>
      <DayThursdayItem></DayThursdayItem>
      <DayFridayItem></DayFridayItem>
    </div>
  );
};
export default DaysContainerItem;
