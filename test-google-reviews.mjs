import assert from 'assert';
import {
  saveConfig,
  getAllConfigs,
  getConfigByHotelAndBranch,
  updateConfigStatus,
  recordReviewClick,
  getClickAnalytics,
  isValidUrl,
  deleteConfig,
} from './lib/reviewConfigStore.js';

console.log('--- STARTING GOOGLE REVIEW MANAGEMENT SYSTEM TESTS ---');

// Test 1: URL format validator
console.log('Test 1: URL format validator');
assert.strictEqual(isValidUrl('https://search.google.com/local/writereview?placeid=123'), true);
assert.strictEqual(isValidUrl('https://g.page/r/abc/review'), true);
assert.strictEqual(isValidUrl('not-a-valid-url'), false);
assert.strictEqual(isValidUrl(''), false);
console.log('✓ Test 1 passed.');

// Test 2: Validation of required fields
console.log('Test 2: Validation of required fields (hotelName, location, reviewUrl)');
assert.throws(() => {
  saveConfig({
    hotelName: '',
    location: 'Chennai',
  });
}, /Hotel \/ Restaurant Name is required/);

assert.throws(() => {
  saveConfig({
    hotelName: 'Taj Connemara',
    location: '',
  });
}, /Hotel Location is required/);

assert.throws(() => {
  saveConfig({
    hotelName: 'Taj Connemara',
    location: 'Chennai',
    status: 'active',
    reviewUrl: '',
  });
}, /Google Review URL is required to activate/);

assert.throws(() => {
  saveConfig({
    hotelName: 'Taj Connemara',
    location: 'Chennai',
    reviewUrl: 'invalid-url',
  });
}, /Google Review URL must be a valid web address/);
console.log('✓ Test 2 passed.');

// Test 3: Create configuration for Hotel A
console.log('Test 3: Admin creates a review button configuration for Hotel A');
const hotelA = saveConfig({
  hotelId: 'hotel-alpha',
  branchId: 'main',
  hotelName: 'Hotel Alpha Residency',
  location: 'Guindy, Chennai',
  branchName: 'Main Tower',
  address: '100 Mount Road, Guindy',
  reviewUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Alpha+Residency+Guindy',
  buttonLabel: 'Rate Hotel Alpha on Google',
  theme: 'light',
  status: 'active',
  verified: true,
});
assert.strictEqual(hotelA.hotelId, 'hotel-alpha');
assert.strictEqual(hotelA.reviewUrl, 'https://www.google.com/maps/search/?api=1&query=Hotel+Alpha+Residency+Guindy');
assert.strictEqual(hotelA.status, 'active');
console.log('✓ Test 3 passed: Hotel A configuration created.');

// Test 4: Create configuration for Hotel B
console.log('Test 4: Admin creates another configuration for Hotel B');
const hotelB = saveConfig({
  hotelId: 'hotel-beta',
  branchId: 'main',
  hotelName: 'Hotel Beta Suites',
  location: 'OMR, Chennai',
  branchName: 'IT Park Branch',
  address: '200 OMR Highway, Sholinganallur',
  reviewUrl: 'https://g.page/r/beta456/review',
  buttonLabel: 'Review Beta Suites on Google',
  theme: 'dark',
  status: 'active',
  verified: true,
});
assert.strictEqual(hotelB.hotelId, 'hotel-beta');
assert.strictEqual(hotelB.reviewUrl, 'https://g.page/r/beta456/review');
assert.strictEqual(hotelB.theme, 'dark');
console.log('✓ Test 4 passed: Hotel B configuration created.');

// Test 5: Verify multi-hotel isolation (Hotel A and Hotel B have distinct review destinations)
console.log('Test 5: Verify Hotel A and Hotel B have distinct review destinations');
const fetchedA = getConfigByHotelAndBranch('hotel-alpha');
const fetchedB = getConfigByHotelAndBranch('hotel-beta');
assert.strictEqual(fetchedA.reviewUrl, 'https://www.google.com/maps/search/?api=1&query=Hotel+Alpha+Residency+Guindy');
assert.strictEqual(fetchedB.reviewUrl, 'https://g.page/r/beta456/review');
assert.notStrictEqual(fetchedA.reviewUrl, fetchedB.reviewUrl);
console.log('✓ Test 5 passed: Review destinations are properly isolated.');

// Test 6: Editing Hotel A does not modify Hotel B
console.log('Test 6: Editing Hotel A does not modify Hotel B');
saveConfig({
  id: hotelA.id,
  hotelId: 'hotel-alpha',
  hotelName: 'Hotel Alpha Premium Luxury',
  location: 'Guindy, Chennai',
  reviewUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Alpha+Luxury+Guindy',
  buttonLabel: 'Review Hotel Alpha Luxury',
  status: 'active',
});

const updatedA = getConfigByHotelAndBranch('hotel-alpha');
const freshB = getConfigByHotelAndBranch('hotel-beta');
assert.strictEqual(updatedA.hotelName, 'Hotel Alpha Premium Luxury');
assert.strictEqual(updatedA.reviewUrl, 'https://www.google.com/maps/search/?api=1&query=Hotel+Alpha+Luxury+Guindy');
assert.strictEqual(freshB.hotelName, 'Hotel Beta Suites');
assert.strictEqual(freshB.reviewUrl, 'https://g.page/r/beta456/review');
console.log('✓ Test 6 passed: Editing Hotel A does not affect Hotel B.');

// Test 7: Deactivating a configuration
console.log('Test 7: Deactivating configuration sets status to inactive');
updateConfigStatus(hotelA.id, 'inactive');
const inactiveA = getConfigByHotelAndBranch('hotel-alpha');
assert.strictEqual(inactiveA.status, 'inactive');
console.log('✓ Test 7 passed: Status toggling works.');

// Test 8: Recording outbound review clicks (1st, 2nd, nth clicks)
console.log('Test 8: Recording outbound review clicks (1st, 2nd, nth clicks)');
const initialClicks = freshB.clickCount || 0;
const click1 = recordReviewClick({ hotelId: 'hotel-beta', placement: 'qr_menu' });
assert.strictEqual(click1.success, true);
assert.strictEqual(click1.clickCount, initialClicks + 1);

const click2 = recordReviewClick({ hotelId: 'hotel-beta', placement: 'qr_menu' });
assert.strictEqual(click2.clickCount, initialClicks + 2);

const click3 = recordReviewClick({ hotelId: 'hotel-beta', placement: 'feedback' });
assert.strictEqual(click3.clickCount, initialClicks + 3);

const statsB = getClickAnalytics('hotel-beta');
assert.strictEqual(statsB.placementBreakdown.qr_menu >= 2, true);
assert.strictEqual(statsB.placementBreakdown.feedback >= 1, true);
console.log('✓ Test 8 passed: Click analytics accurately record and increment on nth click.');

// Test 9: Handling missing hotel configurations gracefully
console.log('Test 9: Missing configuration handled gracefully');
const missingConfig = getConfigByHotelAndBranch('non-existent-hotel-id');
assert.strictEqual(missingConfig, null);
console.log('✓ Test 9 passed: Missing hotel returns null without throwing.');

// Test 10: Safe review URL resolution for Anbu'de Cafe
console.log('Test 10: Safe review URL resolution for Anbu\'de Cafe');
const cafeConfig = getConfigByHotelAndBranch('anbude-cafe');
assert.strictEqual(cafeConfig.reviewUrl, 'https://www.google.com/maps/search/?api=1&query=Anbu+cafe+Maraimalai+Nagar+Tamil+Nadu');
console.log('✓ Test 10 passed: Properly resolves working non-404 Google URL.');

// Cleanup test records
deleteConfig(hotelA.id);
deleteConfig(hotelB.id);

console.log('--- ALL UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
