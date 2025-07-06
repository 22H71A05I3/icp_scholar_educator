use candid::{CandidType, Principal};
use ic_cdk::api::caller;
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(CandidType, Serialize, Deserialize, Clone)]
enum Role {
    Learner,
    Educator,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct User {
    name: String,
    role: Role,
    enrolled_courses: Vec<u64>,
    completed_courses: Vec<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Course {
    id: u64,
    title: String,
    description: String,
    educator: Principal,
    enrolled_learners: Vec<Principal>,
    completed_learners: Vec<Principal>,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Feedback {
    user: Principal,
    course_id: u64,
    rating: u8,
    comment: String,
}

// STORAGE
thread_local! {
    static USERS: std::cell::RefCell<HashMap<Principal, User>> = std::cell::RefCell::new(HashMap::new());
    static COURSES: std::cell::RefCell<HashMap<u64, Course>> = std::cell::RefCell::new(HashMap::new());
    static FEEDBACKS: std::cell::RefCell<Vec<Feedback>> = std::cell::RefCell::new(Vec::new());
    static NEXT_COURSE_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
}

#[init]
fn init() {
    ic_cdk::println!("ICP Scholar backend initialized.");
}

// Register user
#[update]
fn register_user(name: String, role: String) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if users.contains_key(&caller_id) {
            return "User already registered.".into();
        }

        let role_enum = match role.as_str() {
            "learner" => Role::Learner,
            "educator" => Role::Educator,
            _ => return "Invalid role".into(),
        };

        let user = User {
            name,
            role: role_enum,
            enrolled_courses: vec![],
            completed_courses: vec![],
        };
        users.insert(caller_id, user);
        "Registration successful.".into()
    })
}

// Edit user profile
#[update]
fn edit_profile(new_name: String) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(user) = users.get_mut(&caller_id) {
            user.name = new_name;
            return "Profile updated.".into();
        }
        "User not found.".into()
    })
}

// Create a course
#[update]
fn create_course(title: String, description: String) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let users = users.borrow();
        if let Some(user) = users.get(&caller_id) {
            if let Role::Educator = user.role {
                let course_id = NEXT_COURSE_ID.with(|id| {
                    let mut id = id.borrow_mut();
                    let current = *id;
                    *id += 1;
                    current
                });

                let course = Course {
                    id: course_id,
                    title,
                    description,
                    educator: caller_id,
                    enrolled_learners: vec![],
                    completed_learners: vec![],
                };

                COURSES.with(|courses| {
                    courses.borrow_mut().insert(course_id, course);
                });

                return format!("Course created with ID: {}", course_id);
            }
            return "Only educators can create courses.".into();
        }
        "User not registered.".into()
    })
}

// Delete a course (educator only)
#[update]
fn delete_course(course_id: u64) -> String {
    let caller_id = caller();
    COURSES.with(|courses| {
        let mut courses = courses.borrow_mut();
        if let Some(course) = courses.get(&course_id) {
            if course.educator == caller_id {
                courses.remove(&course_id);
                return "Course deleted.".into();
            } else {
                return "You are not the educator of this course.".into();
            }
        }
        "Course not found.".into()
    })
}

// Enroll in a course
#[update]
fn enroll_course(course_id: u64) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(user) = users.get_mut(&caller_id) {
            if let Role::Learner = user.role {
                COURSES.with(|courses| {
                    let mut courses = courses.borrow_mut();
                    if let Some(course) = courses.get_mut(&course_id) {
                        if !course.enrolled_learners.contains(&caller_id) {
                            course.enrolled_learners.push(caller_id);
                            user.enrolled_courses.push(course_id);
                            return "Enrollment successful.".into();
                        } else {
                            return "Already enrolled.".into();
                        }
                    }
                    "Course not found.".into()
                })
            } else {
                "Only learners can enroll.".into()
            }
        } else {
            "User not registered.".into()
        }
    })
}

// Drop course
#[update]
fn drop_course(course_id: u64) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(user) = users.get_mut(&caller_id) {
            user.enrolled_courses.retain(|&id| id != course_id);
            COURSES.with(|courses| {
                let mut courses = courses.borrow_mut();
                if let Some(course) = courses.get_mut(&course_id) {
                    course.enrolled_learners.retain(|&p| p != caller_id);
                    return "Course dropped.".into();
                }
                "Course not found.".into()
            })
        } else {
            "User not registered.".into()
        }
    })
}

// Mark course as complete
#[update]
fn complete_course(course_id: u64) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        if let Some(user) = users.get_mut(&caller_id) {
            if !user.enrolled_courses.contains(&course_id) {
                return "You are not enrolled.".into();
            }
            if user.completed_courses.contains(&course_id) {
                return "Already completed.".into();
            }
            user.completed_courses.push(course_id);
            COURSES.with(|courses| {
                let mut courses = courses.borrow_mut();
                if let Some(course) = courses.get_mut(&course_id) {
                    course.completed_learners.push(caller_id);
                    return "Marked as completed.".into();
                }
                "Course not found.".into()
            })
        } else {
            "User not registered.".into()
        }
    })
}

// Submit feedback
#[update]
fn submit_feedback(course_id: u64, rating: u8, comment: String) -> String {
    let caller_id = caller();
    if rating < 1 || rating > 5 {
        return "Rating must be between 1 and 5.".into();
    }
    let completed = COURSES.with(|courses| {
        let courses = courses.borrow();
        if let Some(course) = courses.get(&course_id) {
            course.completed_learners.contains(&caller_id)
        } else {
            false
        }
    });

    if !completed {
        return "Complete course first.".into();
    }

    FEEDBACKS.with(|f| {
        f.borrow_mut().push(Feedback {
            user: caller_id,
            course_id,
            rating,
            comment,
        });
    });

    "Feedback submitted.".into()
}

// ===== Query Functions =====

// Get all courses
#[query]
fn get_all_courses() -> Vec<Course> {
    COURSES.with(|courses| courses.borrow().values().cloned().collect())
}

// View my profile
#[query]
fn get_user_profile() -> Option<User> {
    let caller_id = caller();
    USERS.with(|users| users.borrow().get(&caller_id).cloned())
}

// View enrolled courses
#[query]
fn get_my_enrolled_courses() -> Vec<Course> {
    let caller_id = caller();
    USERS.with(|users| {
        let users = users.borrow();
        if let Some(user) = users.get(&caller_id) {
            COURSES.with(|courses| {
                let courses = courses.borrow();
                user.enrolled_courses
                    .iter()
                    .filter_map(|id| courses.get(id).cloned())
                    .collect()
            })
        } else {
            vec![]
        }
    })
}

// View completed courses
#[query]
fn get_my_completed_courses() -> Vec<Course> {
    let caller_id = caller();
    USERS.with(|users| {
        let users = users.borrow();
        if let Some(user) = users.get(&caller_id) {
            COURSES.with(|courses| {
                let courses = courses.borrow();
                user.completed_courses
                    .iter()
                    .filter_map(|id| courses.get(id).cloned())
                    .collect()
            })
        } else {
            vec![]
        }
    })
}

// Get courses created by educator
#[query]
fn get_my_created_courses() -> Vec<Course> {
    let caller_id = caller();
    COURSES.with(|courses| {
        courses
            .borrow()
            .values()
            .filter(|c| c.educator == caller_id)
            .cloned()
            .collect()
    })
}

// Get course feedback
#[query]
fn get_course_feedback(course_id: u64) -> Vec<Feedback> {
    FEEDBACKS.with(|f| {
        f.borrow()
            .iter()
            .filter(|fb| fb.course_id == course_id)
            .cloned()
            .collect()
    })
}

// Average rating of a course
#[query]
fn get_course_average_rating(course_id: u64) -> f32 {
    let ratings: Vec<u8> = FEEDBACKS.with(|f| {
        let fb = f.borrow();
        fb.iter()
            .filter(|fb| fb.course_id == course_id)
            .map(|fb| fb.rating)
            .collect()
    });

    if ratings.is_empty() {
        0.0
    } else {
        let sum: u32 = ratings.iter().map(|&r| r as u32).sum();
        sum as f32 / ratings.len() as f32
    }
}

// Get certificate (dummy text)
#[query]
fn get_certificate(course_id: u64) -> String {
    let caller_id = caller();
    USERS.with(|users| {
        let users = users.borrow();
        if let Some(user) = users.get(&caller_id) {
            if user.completed_courses.contains(&course_id) {
                return format!(
                    "Certificate: {} has completed course ID {} 🎓",
                    user.name, course_id
                );
            }
        }
        "You are not eligible for a certificate.".into()
    })
}

// Get all users (for admin view)
#[query]
fn get_all_users() -> Vec<User> {
    USERS.with(|users| users.borrow().values().cloned().collect())
}



ic_cdk::export_candid!();