import Booking from "../models/booking.model.js";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";

export const scheduleVisit = async (req, res) => {
try {
    const { propertyId, date } = req.body;
    if (!propertyId || !date) return res.status(400).json({ message: "Please pick a date" });
    const customerId = req.user._id;

    // validate property '
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // prevent doule booking 
    const existingBooking = await Booking.findOne({ property: propertyId, date });
    if (existingBooking) return res.status(400).json({ message: "You have already scheduled a visit on this date" });

    // validate customer '
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const booking = new Booking({
      property: propertyId,
      agent: property.agent._id,
      customer: customerId,
      date,
    });

    await booking.save();

    res.status(200).json({message: "Booking saved successfully", booking})


} catch (error) {
    console.log('error in schedule visit', error)
    res.status(500).json({ message: "Internal Server error" });
}
}

export const getBookings = async (req, res) => {
    try {
           const agentId = req.params.id;
            const bookings = await Booking.find({ agent: agentId }).populate(
              "property customer"
            );
            res.status(200).json(bookings);

    } catch (error) {
        console.log("error in getBookings", error)
        res.status(500).json({ message: "Internal Server error" });
    }
}

export const acceptBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId).populate("agent");
        if (!booking)
          return res.status(404).json({ message: "Booking not found" });

          if (req.user._id.toString() !== booking.agent._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
          }
          
    booking.status = "approved";
    await booking.save();

    res.status(200).json({ message: "Booking approved", booking });

    } catch (error) {
        console.log('error accepting booking', error)
        res.status(500).json({ message: "Internal Server error" });
    }
}

export const declineBooking = async (req, res) => {
     try {
        const bookingId = req.params.id;
       const booking = await Booking.findById(bookingId).populate("agent");
       if (!booking)
         return res.status(404).json({ message: "Booking not found" });

       if (req.user._id.toString() !== booking.agent._id.toString()) {
         return res.status(403).json({ message: "Unauthorized" });
       }

       booking.status = "declined";
       await booking.save();

       res.status(200).json({ message: "Booking approved", booking });
     } catch (error) {
       console.log("error declining booking", error);
       res.status(500).json({ message: "Internal Server error" });
     }
}


export const deleteBooking = async (req, res) => {
    try {
           const bookingId = req.params.id;

           const booking = await Booking.findById(bookingId);
           if (!booking)
             return res.status(404).json({ message: "Booking not found" });

           if (req.user._id.toString()!== booking.agent._id.toString()) {
             return res.status(403).json({ message: "Unauthorized" });
           }
           
            await Booking.findByIdAndDelete(bookingId);

            res.status(200).json({ message: "Booking cancelled" });

    } catch (error) {
        console.log('error deleting booking', error);
        res.status(500).json({ message: "Internal Server error" });
    }
}