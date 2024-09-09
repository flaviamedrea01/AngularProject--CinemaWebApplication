import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";


import { PostsService } from "../posts.service";
import { AuthService } from "../../auth/auth.service";

import { Post } from "../post.model";
import { mimeType } from "./mime-type.validator";
import { HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit {

  isSelectOpen = false;
  user: any;
  profileInfo: any;
  userName: any;
  token = this.authService.getToken();
  postCreator: any;

  toggleSelect(event: MouseEvent): void {
    this.isSelectOpen = !this.isSelectOpen;
    event.stopPropagation();
  }

  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = "create";
  private postId: string;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService

  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      movie: new FormControl(null, { validators: [Validators.required] }),

      content: new FormControl(null, { validators: [Validators.required] }),
      rating: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            creator: postData.creator,
            title: postData.title,
            movie: postData.movie,
            content: postData.content,
            rating: postData.rating,
            imagePath: postData.imagePath,
            userName: postData.userName,
          };
          this.form.setValue({
            title: this.post.title,
            movie: this.post.movie,
            content: this.post.content,
            rating: this.post.rating,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });

    this.user = this.authService.getUserData();
    const userId = this.authService.getId();

    this.authService.getProfile(userId).subscribe(
      (data) => {
        this.profileInfo = data;
        if ( this.profileInfo.firstName ) {
          this.userName = this.profileInfo.firstName;
          this.postCreator = this.profileInfo._id;
        }
      });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }



    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.movie,
        this.form.value.content,
        this.form.value.rating,
        this.form.value.image,
        this.userName
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.postCreator,
        this.form.value.title,
        this.form.value.movie,
        this.form.value.content,
        this.form.value.rating,
        this.form.value.image,
        this.userName,
      );
    }
    this.form.reset();
  }


  onDelete(postId: string) {

    this.postsService.deletePost(postId);
  }
}

