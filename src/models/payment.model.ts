import mongoose from "mongoose";

enum PaymentProvider {
  KBZ_PAY = "kbz_pay",
  AYA_PAY = "aya_pay",
  CB_PAY = "cb_pay",
  ONE_PAY = "one_pay",

}

const PaymentSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
	},
  paymentProvider: PaymentProvider,
	account_id: {
		type: Number,
		required: true,
	},
});

export default PaymentSchema;